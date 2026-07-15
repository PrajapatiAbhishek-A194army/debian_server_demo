from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from source.shared_backend_infrastructure.database.database_connection import yield_database_session
from source.modules.user_authentication.user_authentication_router import get_current_authenticated_user
from source.modules.user_authentication.user_database_model import UserDatabaseModel
from source.modules.wishlist.wishlist_contracts import (
    AddWishlistItemRequest,
    WishlistItemDetailsResponse
)
from source.modules.wishlist.wishlist_repository import WishlistRepository
from source.modules.shoe_catalog.shoe_repository import ShoeRepository
from source.modules.wishlist.wishlist_workflows import (
    retrieve_user_wishlist_workflow,
    add_item_to_wishlist_workflow,
    remove_item_from_wishlist_workflow,
    WishlistItemNotFoundError,
    ShoeNotFoundError
)

wishlist_router = APIRouter(
    prefix="/api/v1/wishlist",
    tags=["Wishlist"]
)

@wishlist_router.get("", response_model=List[WishlistItemDetailsResponse])
def get_wishlist_endpoint(
    current_user: UserDatabaseModel = Depends(get_current_authenticated_user),
    database_session: Session = Depends(yield_database_session)
) -> List[WishlistItemDetailsResponse]:
    """
    Retrieves the wishlist items of the logged-in customer.
    """
    wishlist_repository = WishlistRepository(database_session)
    return retrieve_user_wishlist_workflow(current_user.id, wishlist_repository)

@wishlist_router.post(
    "", 
    response_model=WishlistItemDetailsResponse, 
    status_code=status.HTTP_201_CREATED
)
def add_item_to_wishlist_endpoint(
    addition_request: AddWishlistItemRequest,
    current_user: UserDatabaseModel = Depends(get_current_authenticated_user),
    database_session: Session = Depends(yield_database_session)
) -> WishlistItemDetailsResponse:
    """
    Adds a shoe to the customer's wishlist.
    """
    wishlist_repository = WishlistRepository(database_session)
    shoe_repository = ShoeRepository(database_session)
    try:
        return add_item_to_wishlist_workflow(
            customer_identifier=current_user.id,
            addition_request=addition_request,
            wishlist_repository=wishlist_repository,
            shoe_repository=shoe_repository
        )
    except ShoeNotFoundError as catalog_error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(catalog_error)
        )

@wishlist_router.delete("/{wishlist_item_identifier}", status_code=status.HTTP_204_NO_CONTENT)
def remove_item_from_wishlist_endpoint(
    wishlist_item_identifier: int,
    current_user: UserDatabaseModel = Depends(get_current_authenticated_user),
    database_session: Session = Depends(yield_database_session)
) -> None:
    """
    Removes a specific item from the wishlist.
    """
    wishlist_repository = WishlistRepository(database_session)
    try:
        remove_item_from_wishlist_workflow(
            customer_identifier=current_user.id,
            wishlist_item_identifier=wishlist_item_identifier,
            wishlist_repository=wishlist_repository
        )
    except WishlistItemNotFoundError as not_found_error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(not_found_error)
        )
