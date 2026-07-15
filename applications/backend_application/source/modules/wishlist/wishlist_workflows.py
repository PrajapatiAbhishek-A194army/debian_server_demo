from typing import List
from source.modules.wishlist.wishlist_contracts import (
    AddWishlistItemRequest,
    WishlistItemDetailsResponse
)
from source.modules.wishlist.wishlist_repository import WishlistRepository
from source.modules.wishlist.wishlist_item_database_model import WishlistItemDatabaseModel
from source.modules.shoe_catalog.shoe_repository import ShoeRepository
from source.modules.shoe_catalog.shoe_catalog_workflows import ShoeNotFoundError

class WishlistItemNotFoundError(Exception):
    """Raised when a specific wishlist item does not exist for the user."""
    pass

def retrieve_user_wishlist_workflow(
    customer_identifier: int,
    wishlist_repository: WishlistRepository
) -> List[WishlistItemDetailsResponse]:
    """
    Retrieves the customer's wishlist items.
    """
    wishlist_items = wishlist_repository.retrieve_wishlist_items_for_customer(customer_identifier)
    return [
        WishlistItemDetailsResponse(
            id=item.id,
            shoe_id=item.shoe_id,
            name=item.shoe.name,
            brand=item.shoe.brand,
            price=item.shoe.price,
            image_url=item.shoe.image_url
        )
        for item in wishlist_items
    ]

def add_item_to_wishlist_workflow(
    customer_identifier: int,
    addition_request: AddWishlistItemRequest,
    wishlist_repository: WishlistRepository,
    shoe_repository: ShoeRepository
) -> WishlistItemDetailsResponse:
    """
    Adds a shoe item to the customer's wishlist.
    """
    # Verify the shoe exists
    shoe = shoe_repository.retrieve_shoe_by_id(addition_request.shoe_id)
    if shoe is None:
        raise ShoeNotFoundError(f"Shoe with identifier {addition_request.shoe_id} was not found.")

    # Check if item is already in user's wishlist
    existing_wishlist_item = wishlist_repository.retrieve_wishlist_item_by_customer_and_shoe(
        customer_identifier, 
        addition_request.shoe_id
    )

    if existing_wishlist_item is not None:
        saved_item = existing_wishlist_item
    else:
        new_wishlist_item = WishlistItemDatabaseModel(
            customer_id=customer_identifier,
            shoe_id=addition_request.shoe_id
        )
        saved_item = wishlist_repository.save_wishlist_item(new_wishlist_item)
        saved_item.shoe = shoe

    return WishlistItemDetailsResponse(
        id=saved_item.id,
        shoe_id=saved_item.shoe_id,
        name=saved_item.shoe.name,
        brand=saved_item.shoe.brand,
        price=saved_item.shoe.price,
        image_url=saved_item.shoe.image_url
    )

def remove_item_from_wishlist_workflow(
    customer_identifier: int,
    wishlist_item_identifier: int,
    wishlist_repository: WishlistRepository
) -> None:
    """
    Removes an item from the customer's wishlist.
    """
    wishlist_item = wishlist_repository.retrieve_wishlist_item_by_id_and_customer(
        wishlist_item_identifier, 
        customer_identifier
    )
    if wishlist_item is None:
        raise WishlistItemNotFoundError(
            f"Wishlist item with identifier {wishlist_item_identifier} was not found in your wishlist."
        )
    
    wishlist_repository.delete_wishlist_item(wishlist_item)
