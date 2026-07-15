from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from typing import List, Optional
from source.modules.order_management.order_database_model import OrderDatabaseModel, OrderLineItemDatabaseModel

class OrderRepository:
    """
    Handles database operations for order transactions and purchased item lines.
    """
    def __init__(self, database_session: Session):
        self.database_session = database_session

    def retrieve_order_by_id(self, order_identifier: int) -> Optional[OrderDatabaseModel]:
        """
        Retrieves a single order (with pre-loaded line items) by its ID.
        """
        return self.database_session.query(OrderDatabaseModel).options(
            joinedload(OrderDatabaseModel.line_items).joinedload(OrderLineItemDatabaseModel.shoe)
        ).filter(OrderDatabaseModel.id == order_identifier).first()

    def retrieve_order_by_razorpay_order_id(self, razorpay_order_identifier: str) -> Optional[OrderDatabaseModel]:
        """
        Retrieves an order by its Razorpay transaction order ID.
        """
        return self.database_session.query(OrderDatabaseModel).options(
            joinedload(OrderDatabaseModel.line_items).joinedload(OrderLineItemDatabaseModel.shoe)
        ).filter(OrderDatabaseModel.razorpay_order_id == razorpay_order_identifier).first()

    def retrieve_orders_for_customer(self, customer_identifier: int) -> List[OrderDatabaseModel]:
        """
        Retrieves all order histories (with line items) belonging to the given customer.
        """
        return self.database_session.query(OrderDatabaseModel).options(
            joinedload(OrderDatabaseModel.line_items).joinedload(OrderLineItemDatabaseModel.shoe)
        ).filter(
            OrderDatabaseModel.customer_id == customer_identifier
        ).order_by(OrderDatabaseModel.created_at.desc()).all()

    def retrieve_all_orders(self) -> List[OrderDatabaseModel]:
        """
        Retrieves all orders in the system. Useful for administrator dashboards.
        """
        return self.database_session.query(OrderDatabaseModel).options(
            joinedload(OrderDatabaseModel.line_items).joinedload(OrderLineItemDatabaseModel.shoe)
        ).order_by(OrderDatabaseModel.created_at.desc()).all()

    def save_order(self, order_database_instance: OrderDatabaseModel) -> OrderDatabaseModel:
        """
        Saves or updates an order transaction record.
        """
        self.database_session.add(order_database_instance)
        self.database_session.flush()
        return order_database_instance

    def save_order_line_item(self, line_item_database_instance: OrderLineItemDatabaseModel) -> OrderLineItemDatabaseModel:
        """
        Saves a purchase order line item.
        """
        self.database_session.add(line_item_database_instance)
        self.database_session.flush()
        return line_item_database_instance
