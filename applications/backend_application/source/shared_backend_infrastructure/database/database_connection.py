import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# Fetch the database connection URL from environment variables
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres_user:postgres_password@localhost:5432/shoe_erp_database"
)

# Initialize engine and sessionmaker
database_engine = create_engine(DATABASE_URL)
database_session_factory = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=database_engine
)

def yield_database_session() -> Generator[Session, None, None]:
    """
    Generates a new database session, handling commit, rollback, and cleanup.
    Intended to be used as a dependency in FastAPI route parameters.
    """
    database_session = database_session_factory()
    try:
        yield database_session
        database_session.commit()
    except Exception as database_operation_exception:
        database_session.rollback()
        raise database_operation_exception
    finally:
        database_session.close()
