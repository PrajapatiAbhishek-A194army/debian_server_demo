from sqlalchemy.orm import Session
from typing import List, Optional
from source.modules.wishlist.wishlist_item_database_model import WishlistItemDatabaseModel

class WishlistRepository:
    """
    Handles database operations for customer wishlists.
    """
    def __init__(self, database_session: Session):
        self.database_session = database_session

    def retrieve_wishlist_item_by_customer_and_shoe(
        self, 
        customer_identifier: int, 
        shoe_identifier: int
    ) -> Optional[WishlistItemDatabaseModel]:
        """
        Retrieves a single wishlist item matching customer ID and shoe ID.
        """
        return self.database_session.query(WishlistItemDatabaseModel).filter(
            WishlistItemDatabaseModel.customer_id == customer_identifier,
            WishlistItemDatabaseModel.shoe_id == shoe_identifier
        ).first()

    def retrieve_wishlist_item_by_id_and_customer(
        self, 
        wishlist_item_identifier: int, 
        customer_identifier: int
    ) -> Optional[WishlistItemDatabaseModel]:
        """
        Retrieves a wishlist item by ID, ensuring it belongs to the given customer.
        """
        return self.database_session.query(WishlistItemDatabaseModel).filter(
            WishlistItemDatabaseModel.id == wishlist_item_identifier,
            WishlistItemDatabaseModel.customer_id == customer_identifier
        ).first()

    def retrieve_wishlist_items_for_customer(self, customer_identifier: int) -> List[WishlistItemDatabaseModel]:
        """
        Retrieves all wishlist items for a customer.
        """
        return self.database_session.query(WishlistItemDatabaseModel).filter(
            WishlistItemDatabaseModel.customer_id == customer_identifier
        ).all()

    def save_wishlist_item(self, wishlist_item_database_instance: WishlistItemDatabaseModel) -> WishlistItemDatabaseModel:
        """
        Saves a new wishlist item.
        """
        self.database_session.add(wishlist_item_database_instance)
        self.database_session.flush()
        return wishlist_item_database_instance

    def delete_wishlist_item(self, wishlist_item_database_instance: WishlistItemDatabaseModel) -> None:
        """
        Removes an item from the database.
        """
        self.database_session.delete(wishlist_item_database_instance)
        self.database_session.flush()
