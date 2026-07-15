from sqlalchemy.orm import DeclarativeBase

class DatabaseModelBase(DeclarativeBase):
    """
    Shared base class for all database models in the system.
    Provides standard SQLAlchemy declarative base setup.
    """
    pass
