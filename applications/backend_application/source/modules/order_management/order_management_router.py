from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session
from typing import List
from source.shared_backend_infrastructure.database.database_connection import yield_database_session
from source.modules.user_authentication.user_authentication_router import (
    get_current_authenticated_user,
    get_current_administrator_user
)
from source.modules.user_authentication.user_database_model import UserDatabaseModel
from source.modules.order_management.order_management_contracts import (
    CheckoutInitializationResponse,
    VerifyPaymentRequest,
    OrderDetailsResponse
)
from source.modules.order_management.order_repository import OrderRepository
from source.modules.shopping_cart.shopping_cart_repository import ShoppingCartRepository
from source.modules.shoe_catalog.shoe_repository import ShoeRepository
from source.modules.order_management.razorpay_payment_gateway import RazorpayPaymentGateway
from source.modules.order_management.order_management_workflows import (
    initialize_checkout_workflow,
    verify_payment_workflow,
    retrieve_customer_orders_workflow,
    retrieve_all_system_orders_workflow,
    process_razorpay_webhook_event,
    EmptyCartError,
    InsufficientStockError,
    OrderNotFoundError,
    PaymentVerificationFailedError,
    WebhookSignatureInvalidError
)

order_management_router = APIRouter(
    prefix="/api/v1/order-management",
    tags=["Order Management"]
)

razorpay_payment_gateway_instance = RazorpayPaymentGateway()

@order_management_router.post("/checkout", response_model=CheckoutInitializationResponse)
def initialize_checkout_endpoint(
    current_user: UserDatabaseModel = Depends(get_current_authenticated_user),
    database_session: Session = Depends(yield_database_session)
) -> CheckoutInitializationResponse:
    """
    Endpoint to initialize checkout, booking the pending order and registering with Razorpay.
    """
    cart_repository = ShoppingCartRepository(database_session)
    shoe_repository = ShoeRepository(database_session)
    order_repository = OrderRepository(database_session)
    try:
        return initialize_checkout_workflow(
            customer_identifier=current_user.id,
            cart_repository=cart_repository,
            shoe_repository=shoe_repository,
            order_repository=order_repository,
            razorpay_gateway=razorpay_payment_gateway_instance
        )
    except EmptyCartError as empty_cart_exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(empty_cart_exception)
        )
    except InsufficientStockError as stock_exception:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(stock_exception)
        )

@order_management_router.post("/verify-payment", response_model=OrderDetailsResponse)
def verify_payment_endpoint(
    verification_request: VerifyPaymentRequest,
    current_user: UserDatabaseModel = Depends(get_current_authenticated_user),
    database_session: Session = Depends(yield_database_session)
) -> OrderDetailsResponse:
    """
    Endpoint to verify online payment signatures and finalize orders.
    """
    order_repository = OrderRepository(database_session)
    cart_repository = ShoppingCartRepository(database_session)
    shoe_repository = ShoeRepository(database_session)
    try:
        return verify_payment_workflow(
            customer_identifier=current_user.id,
            payment_verification_request=verification_request,
            order_repository=order_repository,
            cart_repository=cart_repository,
            shoe_repository=shoe_repository,
            razorpay_gateway=razorpay_payment_gateway_instance
        )
    except OrderNotFoundError as not_found_exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(not_found_exception)
        )
    except PaymentVerificationFailedError as payment_failed_exception:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=str(payment_failed_exception)
        )
    except InsufficientStockError as stock_exception:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(stock_exception)
        )

@order_management_router.get("/history", response_model=List[OrderDetailsResponse])
def get_customer_order_history_endpoint(
    current_user: UserDatabaseModel = Depends(get_current_authenticated_user),
    database_session: Session = Depends(yield_database_session)
) -> List[OrderDetailsResponse]:
    """
    Retrieves the logged-in customer's order history.
    """
    order_repository = OrderRepository(database_session)
    return retrieve_customer_orders_workflow(
        customer_identifier=current_user.id,
        order_repository=order_repository
    )

@order_management_router.get(
    "/admin/orders", 
    response_model=List[OrderDetailsResponse],
    dependencies=[Depends(get_current_administrator_user)]
)
def get_all_orders_for_admin_endpoint(
    database_session: Session = Depends(yield_database_session)
) -> List[OrderDetailsResponse]:
    """
    Retrieves all order transactions in the system. Administrative privileges required.
    """
    order_repository = OrderRepository(database_session)
    return retrieve_all_system_orders_workflow(order_repository)


@order_management_router.post("/webhook/razorpay")
async def razorpay_webhook_endpoint(
    request: Request,
    database_session: Session = Depends(yield_database_session)
):
    """
    Razorpay Webhook Endpoint.
    
    This endpoint receives POST requests from Razorpay when payment events occur
    (e.g. payment.captured, payment.failed, order.paid).
    
    Configure this URL in your Razorpay Dashboard:
        Settings → Webhooks → Add New Webhook
        URL: https://your-domain.com/api/v1/order-management/webhook/razorpay
    
    No JWT authentication is required — Razorpay authenticates via HMAC signature.
    """
    request_body_bytes = await request.body()
    webhook_signature_header = request.headers.get("X-Razorpay-Signature", "")

    import json
    try:
        event_payload = json.loads(request_body_bytes)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload."
        )

    order_repository = OrderRepository(database_session)
    shoe_repository = ShoeRepository(database_session)
    cart_repository = ShoppingCartRepository(database_session)

    try:
        result = process_razorpay_webhook_event(
            event_payload=event_payload,
            request_body_bytes=request_body_bytes,
            webhook_signature_header=webhook_signature_header,
            order_repository=order_repository,
            shoe_repository=shoe_repository,
            cart_repository=cart_repository,
            razorpay_gateway=razorpay_payment_gateway_instance
        )
        return Response(
            content=json.dumps(result),
            status_code=200,
            media_type="application/json"
        )
    except WebhookSignatureInvalidError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature."
        )

