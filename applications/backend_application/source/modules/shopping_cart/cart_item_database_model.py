from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from source.shared_backend_infrastructure.database.database_model_base import DatabaseModelBase
from source.modules.shoe_catalog.shoe_database_model import ShoeDatabaseModel

class CartItemDatabaseModel(DatabaseModelBase):
    """
    SQLAlchemy database model representing items placed in a customer's shopping cart.
    """
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    shoe_id = Column(Integer, ForeignKey("shoes.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)

    # Establish relation to Shoe catalog model
    shoe = relationship(ShoeDatabaseModel)
