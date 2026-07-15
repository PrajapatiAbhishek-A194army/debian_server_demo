from sqlalchemy import Column, Integer, String
from source.shared_backend_infrastructure.database.database_model_base import DatabaseModelBase

class UserDatabaseModel(DatabaseModelBase):
    """
    SQLAlchemy database model for system users, representing both administrators and customers.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="customer")  # Valid values: "admin", "customer"
