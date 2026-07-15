from sqlalchemy.orm import Session
from typing import List, Optional
from source.modules.shopping_cart.cart_item_database_model import CartItemDatabaseModel

class ShoppingCartRepository:
    """
    Handles database operations for customer shopping cart items.
    """
    def __init__(self, database_session: Session):
        self.database_session = database_session

    def retrieve_cart_item_by_customer_and_shoe(
        self, 
        customer_identifier: int, 
        shoe_identifier: int
    ) -> Optional[CartItemDatabaseModel]:
        """
        Retrieves a single cart item for a given customer and shoe.
        """
        return self.database_session.query(CartItemDatabaseModel).filter(
            CartItemDatabaseModel.customer_id == customer_identifier,
            CartItemDatabaseModel.shoe_id == shoe_identifier
        ).first()

    def retrieve_cart_item_by_id_and_customer(
        self, 
        cart_item_identifier: int, 
        customer_identifier: int
    ) -> Optional[CartItemDatabaseModel]:
        """
        Retrieves a single cart item by its ID, ensuring it belongs to the given customer.
        """
        return self.database_session.query(CartItemDatabaseModel).filter(
            CartItemDatabaseModel.id == cart_item_identifier,
            CartItemDatabaseModel.customer_id == customer_identifier
        ).first()

    def retrieve_cart_items_for_customer(self, customer_identifier: int) -> List[CartItemDatabaseModel]:
        """
        Retrieves all cart items (including their associated shoes) for a specific customer.
        """
        return self.database_session.query(CartItemDatabaseModel).filter(
            CartItemDatabaseModel.customer_id == customer_identifier
        ).all()

    def save_cart_item(self, cart_item_database_instance: CartItemDatabaseModel) -> CartItemDatabaseModel:
        """
        Saves or updates a cart item record.
        """
        self.database_session.add(cart_item_database_instance)
        self.database_session.flush()
        return cart_item_database_instance

    def delete_cart_item(self, cart_item_database_instance: CartItemDatabaseModel) -> None:
        """
        Deletes a single item from the cart.
        """
        self.database_session.delete(cart_item_database_instance)
        self.database_session.flush()

    def clear_cart_for_customer(self, customer_identifier: int) -> None:
        """
        Deletes all cart items belonging to the customer.
        """
        self.database_session.query(CartItemDatabaseModel).filter(
            CartItemDatabaseModel.customer_id == customer_identifier
        ).delete(synchronize_session=False)
        self.database_session.flush()
        # Note: synchronize_session=False is optimal since we do a direct bulk delete.
