from typing import List
from source.modules.shopping_cart.shopping_cart_contracts import (
    AddCartItemRequest,
    UpdateCartItemQuantityRequest,
    CartItemDetailsResponse,
    ShoppingCartSummaryResponse
)
from source.modules.shopping_cart.shopping_cart_repository import ShoppingCartRepository
from source.modules.shopping_cart.cart_item_database_model import CartItemDatabaseModel
from source.modules.shoe_catalog.shoe_repository import ShoeRepository
from source.modules.shoe_catalog.shoe_catalog_workflows import ShoeNotFoundError

class CartItemNotFoundError(Exception):
    """Raised when a specific shopping cart item does not exist for the user."""
    pass

def retrieve_user_shopping_cart_workflow(
    customer_identifier: int,
    cart_repository: ShoppingCartRepository
) -> ShoppingCartSummaryResponse:
    """
    Retrieves the customer's shopping cart, calculating line subtotals and the total amount.
    """
    cart_items = cart_repository.retrieve_cart_items_for_customer(customer_identifier)
    
    detailed_items: List[CartItemDetailsResponse] = []
    total_amount = 0.0

    for item in cart_items:
        line_item_subtotal = item.shoe.price * item.quantity
        total_amount += line_item_subtotal
        
        detailed_items.append(
            CartItemDetailsResponse(
                id=item.id,
                shoe_id=item.shoe_id,
                name=item.shoe.name,
                brand=item.shoe.brand,
                price=item.shoe.price,
                quantity=item.quantity,
                image_url=item.shoe.image_url,
                subtotal=line_item_subtotal
            )
        )

    return ShoppingCartSummaryResponse(
        items=detailed_items,
        total_amount=total_amount
    )

def add_item_to_shopping_cart_workflow(
    customer_identifier: int,
    addition_request: AddCartItemRequest,
    cart_repository: ShoppingCartRepository,
    shoe_repository: ShoeRepository
) -> CartItemDetailsResponse:
    """
    Adds a shoe item to the customer's cart or increments the quantity if already present.
    """
    # Verify the shoe exists in the catalog
    shoe = shoe_repository.retrieve_shoe_by_id(addition_request.shoe_id)
    if shoe is None:
        raise ShoeNotFoundError(f"Shoe with identifier {addition_request.shoe_id} was not found.")

    # Check if item is already in user's cart
    existing_cart_item = cart_repository.retrieve_cart_item_by_customer_and_shoe(
        customer_identifier, 
        addition_request.shoe_id
    )

    if existing_cart_item is not None:
        existing_cart_item.quantity += addition_request.quantity
        saved_item = cart_repository.save_cart_item(existing_cart_item)
    else:
        new_cart_item = CartItemDatabaseModel(
            customer_id=customer_identifier,
            shoe_id=addition_request.shoe_id,
            quantity=addition_request.quantity
        )
        saved_item = cart_repository.save_cart_item(new_cart_item)
        # Populate relationship for response mapping
        saved_item.shoe = shoe

    line_item_subtotal = saved_item.shoe.price * saved_item.quantity

    return CartItemDetailsResponse(
        id=saved_item.id,
        shoe_id=saved_item.shoe_id,
        name=saved_item.shoe.name,
        brand=saved_item.shoe.brand,
        price=saved_item.shoe.price,
        quantity=saved_item.quantity,
        image_url=saved_item.shoe.image_url,
        subtotal=line_item_subtotal
    )

def update_shopping_cart_item_quantity_workflow(
    customer_identifier: int,
    cart_item_identifier: int,
    update_request: UpdateCartItemQuantityRequest,
    cart_repository: ShoppingCartRepository
) -> CartItemDetailsResponse:
    """
    Updates the quantity of an item in the customer's cart.
    """
    cart_item = cart_repository.retrieve_cart_item_by_id_and_customer(
        cart_item_identifier, 
        customer_identifier
    )
    if cart_item is None:
        raise CartItemNotFoundError(
            f"Cart item with identifier {cart_item_identifier} was not found in your cart."
        )

    cart_item.quantity = update_request.quantity
    saved_item = cart_repository.save_cart_item(cart_item)
    
    line_item_subtotal = saved_item.shoe.price * saved_item.quantity

    return CartItemDetailsResponse(
        id=saved_item.id,
        shoe_id=saved_item.shoe_id,
        name=saved_item.shoe.name,
        brand=saved_item.shoe.brand,
        price=saved_item.shoe.price,
        quantity=saved_item.quantity,
        image_url=saved_item.shoe.image_url,
        subtotal=line_item_subtotal
    )

def remove_item_from_shopping_cart_workflow(
    customer_identifier: int,
    cart_item_identifier: int,
    cart_repository: ShoppingCartRepository
) -> None:
    """
    Removes a single item from the customer's cart.
    """
    cart_item = cart_repository.retrieve_cart_item_by_id_and_customer(
        cart_item_identifier, 
        customer_identifier
    )
    if cart_item is None:
        raise CartItemNotFoundError(
            f"Cart item with identifier {cart_item_identifier} was not found in your cart."
        )
    
    cart_repository.delete_cart_item(cart_item)

def clear_user_shopping_cart_workflow(
    customer_identifier: int,
    cart_repository: ShoppingCartRepository
) -> None:
    """
    Clears all items in the customer's cart.
    """
    cart_repository.clear_cart_for_customer(customer_identifier)
