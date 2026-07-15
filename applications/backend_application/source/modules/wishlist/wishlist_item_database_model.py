from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from source.shared_backend_infrastructure.database.database_model_base import DatabaseModelBase
from source.modules.shoe_catalog.shoe_database_model import ShoeDatabaseModel

class WishlistItemDatabaseModel(DatabaseModelBase):
    """
    SQLAlchemy database model representing items in a customer's wishlist.
    """
    __tablename__ = "wishlist_items"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    shoe_id = Column(Integer, ForeignKey("shoes.id", ondelete="CASCADE"), nullable=False)

    # Establish relation to Shoe catalog model
    shoe = relationship(ShoeDatabaseModel)
