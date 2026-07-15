from sqlalchemy.orm import Session
from typing import Optional
from source.modules.user_authentication.user_database_model import UserDatabaseModel

class UserRepository:
    """
    Handles database operations for user accounts.
    """
    def __init__(self, database_session: Session):
        self.database_session = database_session

    def retrieve_user_by_email(self, user_email: str) -> Optional[UserDatabaseModel]:
        """
        Retrieves a user database record by their email address.
        """
        return self.database_session.query(UserDatabaseModel).filter(
            UserDatabaseModel.email == user_email
        ).first()

    def retrieve_user_by_id(self, user_identifier: int) -> Optional[UserDatabaseModel]:
        """
        Retrieves a user database record by their primary identifier.
        """
        return self.database_session.query(UserDatabaseModel).filter(
            UserDatabaseModel.id == user_identifier
        ).first()

    def save_new_user(self, user_database_instance: UserDatabaseModel) -> UserDatabaseModel:
        """
        Saves a new user record to the database.
        """
        self.database_session.add(user_database_instance)
        self.database_session.flush()
        return user_database_instance
