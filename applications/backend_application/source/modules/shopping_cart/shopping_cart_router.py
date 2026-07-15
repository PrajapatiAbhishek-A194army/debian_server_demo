from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from source.shared_backend_infrastructure.database.database_connection import yield_database_session
from source.modules.user_authentication.user_authentication_router import get_current_authenticated_user
from source.modules.user_authentication.user_database_model import UserDatabaseModel
from source.modules.shopping_cart.shopping_cart_contracts import (
    AddCartItemRequest,
    UpdateCartItemQuantityRequest,
    CartItemDetailsResponse,
    ShoppingCartSummaryResponse
)
from source.modules.shopping_cart.shopping_cart_repository import ShoppingCartRepository
from source.modules.shoe_catalog.shoe_repository import ShoeRepository
from source.modules.shopping_cart.shopping_cart_workflows import (
    retrieve_user_shopping_cart_workflow,
    add_item_to_shopping_cart_workflow,
    update_shopping_cart_item_quantity_workflow,
    remove_item_from_shopping_cart_workflow,
    clear_user_shopping_cart_workflow,
    CartItemNotFoundError,
    ShoeNotFoundError
)

shopping_cart_router = APIRouter(
    prefix="/api/v1/shopping-cart",
    tags=["Shopping Cart"]
)

@shopping_cart_router.get("", response_model=ShoppingCartSummaryResponse)
def get_shopping_cart_endpoint(
    current_user: UserDatabaseModel = Depends(get_current_authenticated_user),
    database_session: Session = Depends(yield_database_session)
) -> ShoppingCartSummaryResponse:
    """
    Retrieves the shopping cart of the logged-in customer.
    """
    cart_repository = ShoppingCartRepository(database_session)
    return retrieve_user_shopping_cart_workflow(current_user.id, cart_repository)

@shopping_cart_router.post(
    "", 
    response_model=CartItemDetailsResponse, 
    status_code=status.HTTP_201_CREATED
)
def add_item_to_cart_endpoint(
    addition_request: AddCartItemRequest,
    current_user: UserDatabaseModel = Depends(get_current_authenticated_user),
    database_session: Session = Depends(yield_database_session)
) -> CartItemDetailsResponse:
    """
    Adds a shoe item to the shopping cart.
    """
    cart_repository = ShoppingCartRepository(database_session)
    shoe_repository = ShoeRepository(database_session)
    try:
        return add_item_to_shopping_cart_workflow(
            customer_identifier=current_user.id,
            addition_request=addition_request,
            cart_repository=cart_repository,
            shoe_repository=shoe_repository
        )
    except ShoeNotFoundError as catalog_error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(catalog_error)
        )

@shopping_cart_router.put("/{cart_item_identifier}", response_model=CartItemDetailsResponse)
def update_cart_item_quantity_endpoint(
    cart_item_identifier: int,
    update_request: UpdateCartItemQuantityRequest,
    current_user: UserDatabaseModel = Depends(get_current_authenticated_user),
    database_session: Session = Depends(yield_database_session)
) -> CartItemDetailsResponse:
    """
    Updates the quantity of a specific item in the cart.
    """
    cart_repository = ShoppingCartRepository(database_session)
    try:
        return update_shopping_cart_item_quantity_workflow(
            customer_identifier=current_user.id,
            cart_item_identifier=cart_item_identifier,
            update_request=update_request,
            cart_repository=cart_repository
        )
    except CartItemNotFoundError as not_found_error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(not_found_error)
        )

@shopping_cart_router.delete("/{cart_item_identifier}", status_code=status.HTTP_204_NO_CONTENT)
def remove_item_from_cart_endpoint(
    cart_item_identifier: int,
    current_user: UserDatabaseModel = Depends(get_current_authenticated_user),
    database_session: Session = Depends(yield_database_session)
) -> None:
    """
    Removes a specific item from the cart.
    """
    cart_repository = ShoppingCartRepository(database_session)
    try:
        remove_item_from_shopping_cart_workflow(
            customer_identifier=current_user.id,
            cart_item_identifier=cart_item_identifier,
            cart_repository=cart_repository
        )
    except CartItemNotFoundError as not_found_error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(not_found_error)
        )

@shopping_cart_router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart_endpoint(
    current_user: UserDatabaseModel = Depends(get_current_authenticated_user),
    database_session: Session = Depends(yield_database_session)
) -> None:
    """
    Clears all items in the customer's cart.
    """
    cart_repository = ShoppingCartRepository(database_session)
    clear_user_shopping_cart_workflow(current_user.id, cart_repository)
