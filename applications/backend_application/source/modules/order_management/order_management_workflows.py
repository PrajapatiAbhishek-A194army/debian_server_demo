from typing import List, Optional
import os
from source.modules.order_management.order_management_contracts import (
    CheckoutInitializationResponse,
    VerifyPaymentRequest,
    OrderDetailsResponse,
    OrderLineItemResponse
)
from source.modules.order_management.order_repository import OrderRepository
from source.modules.order_management.order_database_model import OrderDatabaseModel, OrderLineItemDatabaseModel
from source.modules.shopping_cart.shopping_cart_repository import ShoppingCartRepository
from source.modules.shoe_catalog.shoe_repository import ShoeRepository
from source.modules.order_management.razorpay_payment_gateway import RazorpayPaymentGateway, RAZORPAY_KEY_ID

class EmptyCartError(Exception):
    """Raised when attempting to checkout an empty shopping cart."""
    pass

class InsufficientStockError(Exception):
    """Raised when the requested item quantity exceeds the available shoe catalog stock."""
    pass

class OrderNotFoundError(Exception):
    """Raised when a specified order identifier is not found in the transaction records."""
    pass

class PaymentVerificationFailedError(Exception):
    """Raised when the Razorpay payment signature fails verification."""
    pass

def initialize_checkout_workflow(
    customer_identifier: int,
    cart_repository: ShoppingCartRepository,
    shoe_repository: ShoeRepository,
    order_repository: OrderRepository,
    razorpay_gateway: RazorpayPaymentGateway
) -> CheckoutInitializationResponse:
    """
    Orchestrates order creation by evaluating cart items, booking database records,
    and initializing a Razorpay transaction order.
    """
    cart_items = cart_repository.retrieve_cart_items_for_customer(customer_identifier)
    if not cart_items:
        raise EmptyCartError("Your shopping cart is empty. Cannot proceed to checkout.")

    total_amount = 0.0
    line_item_data = []

    # Verify inventory availability and compute price subtotals
    for cart_item in cart_items:
        shoe = shoe_repository.retrieve_shoe_by_id(cart_item.shoe_id)
        if shoe is None:
            raise InsufficientStockError(
                f"The product '{cart_item.shoe_id}' is no longer available in the catalog."
            )
        
        if shoe.stock_quantity < cart_item.quantity:
            raise InsufficientStockError(
                f"Insufficient stock for '{shoe.name}'. Available: {shoe.stock_quantity}, Requested: {cart_item.quantity}."
            )
        
        total_amount += shoe.price * cart_item.quantity
        line_item_data.append((shoe, cart_item.quantity, shoe.price))

    # Register the pending order record in database
    pending_order = OrderDatabaseModel(
        customer_id=customer_identifier,
        total_amount=total_amount,
        payment_status="PENDING"
    )
    saved_order = order_repository.save_order(pending_order)

    # Attach purchase line items
    for shoe, quantity, price in line_item_data:
        line_item = OrderLineItemDatabaseModel(
            order_id=saved_order.id,
            shoe_id=shoe.id,
            quantity=quantity,
            price=price
        )
        order_repository.save_order_line_item(line_item)

    # Create the online transaction order on Razorpay
    receipt_identifier = f"receipt_order_{saved_order.id}"
    razorpay_order_details = razorpay_gateway.create_payment_order(
        amount_in_inr=total_amount, 
        order_reference_identifier=receipt_identifier
    )

    # Save Razorpay Order ID to database order record
    saved_order.razorpay_order_id = razorpay_order_details.get("id")
    order_repository.save_order(saved_order)

    return CheckoutInitializationResponse(
        order_id=saved_order.id,
        razorpay_order_id=saved_order.razorpay_order_id,
        amount=total_amount,
        currency="INR",
        key_id=RAZORPAY_KEY_ID
    )

def verify_payment_workflow(
    customer_identifier: int,
    payment_verification_request: VerifyPaymentRequest,
    order_repository: OrderRepository,
    cart_repository: ShoppingCartRepository,
    shoe_repository: ShoeRepository,
    razorpay_gateway: RazorpayPaymentGateway
) -> OrderDetailsResponse:
    """
    Validates the signature from Razorpay. On success, updates payment status,
    adjusts product stock quantities, and clears the customer's cart.
    """
    order = order_repository.retrieve_order_by_razorpay_order_id(
        payment_verification_request.razorpay_order_id
    )
    if order is None:
        raise OrderNotFoundError(
            f"No order associated with Razorpay Order ID: {payment_verification_request.razorpay_order_id}."
        )

    # Validate payment authenticity
    is_signature_valid = razorpay_gateway.verify_payment_signature(
        razorpay_order_id=payment_verification_request.razorpay_order_id,
        razorpay_payment_id=payment_verification_request.razorpay_payment_id,
        razorpay_signature=payment_verification_request.razorpay_signature
    )

    if not is_signature_valid:
        order.payment_status = "FAILED"
        order_repository.save_order(order)
        raise PaymentVerificationFailedError(
            "Payment verification failed due to invalid signature."
        )

    # Update order details on successful transaction completion
    order.payment_status = "PAID"
    order.razorpay_payment_id = payment_verification_request.razorpay_payment_id
    order_repository.save_order(order)

    # Adjust catalogue stock levels
    for item in order.line_items:
        if item.shoe is not None:
            if item.shoe.stock_quantity < item.quantity:
                # Stock became unavailable concurrently, fail the processing
                raise InsufficientStockError(
                    f"Concurrency error: Stock for '{item.shoe.name}' became insufficient."
                )
            item.shoe.stock_quantity -= item.quantity
            shoe_repository.save_new_shoe(item.shoe)

    # Clear customer cart
    cart_repository.clear_cart_for_customer(customer_identifier)

    # Construct order details response
    detailed_lines = [
        OrderLineItemResponse(
            id=line.id,
            shoe_id=line.shoe_id,
            shoe_name=line.shoe.name if line.shoe else "Deleted Shoe",
            brand=line.shoe.brand if line.shoe else None,
            quantity=line.quantity,
            price=line.price
        )
        for line in order.line_items
    ]

    return OrderDetailsResponse(
        id=order.id,
        customer_id=order.customer_id,
        total_amount=order.total_amount,
        payment_status=order.payment_status,
        razorpay_order_id=order.razorpay_order_id,
        created_at=order.created_at,
        line_items=detailed_lines
    )

def retrieve_customer_orders_workflow(
    customer_identifier: int,
    order_repository: OrderRepository
) -> List[OrderDetailsResponse]:
    """
    Retrieves the list of past orders placed by the customer.
    """
    customer_orders = order_repository.retrieve_orders_for_customer(customer_identifier)
    return [
        OrderDetailsResponse(
            id=order.id,
            customer_id=order.customer_id,
            total_amount=order.total_amount,
            payment_status=order.payment_status,
            razorpay_order_id=order.razorpay_order_id,
            created_at=order.created_at,
            line_items=[
                OrderLineItemResponse(
                    id=line.id,
                    shoe_id=line.shoe_id,
                    shoe_name=line.shoe.name if line.shoe else "Deleted Shoe",
                    brand=line.shoe.brand if line.shoe else None,
                    quantity=line.quantity,
                    price=line.price
                )
                for line in order.line_items
            ]
        )
        for order in customer_orders
    ]

def retrieve_all_system_orders_workflow(
    order_repository: OrderRepository
) -> List[OrderDetailsResponse]:
    """
    Retrieves a list of all order transactions across the entire system.
    """
    system_orders = order_repository.retrieve_all_orders()
    return [
        OrderDetailsResponse(
            id=order.id,
            customer_id=order.customer_id,
            total_amount=order.total_amount,
            payment_status=order.payment_status,
            razorpay_order_id=order.razorpay_order_id,
            created_at=order.created_at,
            line_items=[
                OrderLineItemResponse(
                    id=line.id,
                    shoe_id=line.shoe_id,
                    shoe_name=line.shoe.name if line.shoe else "Deleted Shoe",
                    brand=line.shoe.brand if line.shoe else None,
                    quantity=line.quantity,
                    price=line.price
                )
                for line in order.line_items
            ]
        )
        for order in system_orders
    ]


class WebhookSignatureInvalidError(Exception):
    """Raised when the Razorpay webhook X-Razorpay-Signature header fails verification."""
    pass


def process_razorpay_webhook_event(
    event_payload: dict,
    request_body_bytes: bytes,
    webhook_signature_header: str,
    order_repository: OrderRepository,
    shoe_repository: ShoeRepository,
    cart_repository: ShoppingCartRepository,
    razorpay_gateway: RazorpayPaymentGateway
) -> dict:
    """
    Processes incoming Razorpay webhook events. Verifies the signature, then handles
    payment.captured, payment.failed, and order.paid events to update order records.
    
    Returns a status dict indicating the processing result.
    """
    import logging
    logger = logging.getLogger("razorpay_webhook")

    # Step 1: Verify webhook signature
    is_signature_valid = razorpay_gateway.verify_webhook_signature(
        request_body_bytes=request_body_bytes,
        webhook_signature_header=webhook_signature_header
    )
    if not is_signature_valid:
        raise WebhookSignatureInvalidError("Webhook signature verification failed.")

    # Step 2: Extract event type and payment entity
    event_type = event_payload.get("event", "")
    payment_entity = (
        event_payload.get("payload", {})
        .get("payment", {})
        .get("entity", {})
    )
    razorpay_order_id = payment_entity.get("order_id", "")
    razorpay_payment_id = payment_entity.get("id", "")

    logger.info(f"Webhook received: event={event_type}, order_id={razorpay_order_id}")

    if not razorpay_order_id:
        return {"status": "ignored", "reason": "No order_id in payload"}

    # Step 3: Find the corresponding order in the database
    order = order_repository.retrieve_order_by_razorpay_order_id(razorpay_order_id)
    if order is None:
        logger.warning(f"Webhook: No order found for razorpay_order_id={razorpay_order_id}")
        return {"status": "ignored", "reason": "Order not found"}

    # Step 4: Handle event types
    if event_type == "payment.captured" or event_type == "order.paid":
        if order.payment_status == "PAID":
            return {"status": "already_processed", "order_id": order.id}

        order.payment_status = "PAID"
        order.razorpay_payment_id = razorpay_payment_id
        order_repository.save_order(order)

        # Decrement stock for each line item
        for line_item in order.line_items:
            if line_item.shoe is not None and line_item.shoe.stock_quantity >= line_item.quantity:
                line_item.shoe.stock_quantity -= line_item.quantity
                shoe_repository.save_new_shoe(line_item.shoe)

        # Clear customer cart
        cart_repository.clear_cart_for_customer(order.customer_id)

        logger.info(f"Webhook: Order #{order.id} marked as PAID via {event_type}")
        return {"status": "captured", "order_id": order.id}

    elif event_type == "payment.failed":
        if order.payment_status != "PAID":
            order.payment_status = "FAILED"
            order_repository.save_order(order)
            logger.info(f"Webhook: Order #{order.id} marked as FAILED")
        return {"status": "failed", "order_id": order.id}

    else:
        logger.info(f"Webhook: Unhandled event type '{event_type}', ignoring.")
        return {"status": "ignored", "reason": f"Unhandled event: {event_type}"}

