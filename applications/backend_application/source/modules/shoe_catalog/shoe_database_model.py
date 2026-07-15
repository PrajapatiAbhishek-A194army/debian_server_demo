from sqlalchemy import Column, Integer, String, Float
from source.shared_backend_infrastructure.database.database_model_base import DatabaseModelBase

class ShoeDatabaseModel(DatabaseModelBase):
    """
    SQLAlchemy database model representing shoe catalog items and stock levels.
    """
    __tablename__ = "shoes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    size = Column(Float, nullable=False, index=True)  # Using Float to support half-sizes (e.g., 9.5, 10.5)
    stock_quantity = Column(Integer, nullable=False, default=0)
    image_url = Column(String, nullable=True)
