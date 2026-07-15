from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from source.shared_backend_infrastructure.database.database_model_base import DatabaseModelBase
from source.modules.shoe_catalog.shoe_database_model import ShoeDatabaseModel

class OrderDatabaseModel(DatabaseModelBase):
    """
    SQLAlchemy database model representing a purchase order and its checkout/payment state.
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    total_amount = Column(Float, nullable=False)
    payment_status = Column(String, nullable=False, default="PENDING")  # "PENDING", "PAID", "FAILED"
    razorpay_order_id = Column(String, nullable=True, unique=True)
    razorpay_payment_id = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    # Relationship to line items
    line_items = relationship("OrderLineItemDatabaseModel", back_populates="order", cascade="all, delete-orphan")

class OrderLineItemDatabaseModel(DatabaseModelBase):
    """
    SQLAlchemy database model representing a single shoe item inside a purchase order.
    """
    __tablename__ = "order_line_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    shoe_id = Column(Integer, ForeignKey("shoes.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)  # Captures price at the time of purchase

    # Relationships
    order = relationship("OrderDatabaseModel", back_populates="line_items")
    shoe = relationship(ShoeDatabaseModel)
