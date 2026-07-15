import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from source.shared_backend_infrastructure.database.database_model_base import DatabaseModelBase
from source.modules.user_authentication.user_database_model import UserDatabaseModel
from source.modules.user_authentication.user_repository import UserRepository
from source.modules.user_authentication.user_authentication_contracts import (
    UserRegistrationRequest,
    UserLoginRequest
)
from source.modules.user_authentication.user_authentication_workflows import (
    register_new_user_workflow,
    authenticate_user_credentials_workflow,
    EmailAddressAlreadyRegisteredError,
    InvalidCredentialsError
)

# Set up in-memory SQLite engine for fast testing
test_database_engine = create_engine("sqlite:///:memory:")
test_session_factory = sessionmaker(bind=test_database_engine)

@pytest.fixture(name="database_session")
def database_session_fixture():
    """
    Creates tables and yields a clean database session for each test.
    """
    DatabaseModelBase.metadata.create_all(bind=test_database_engine)
    session = test_session_factory()
    try:
      yield session
    finally:
      session.close()
      DatabaseModelBase.metadata.drop_all(bind=test_database_engine)

def test_user_registration_saves_user_successfully(database_session):
    # Arrange
    user_repository = UserRepository(database_session)
    registration_request = UserRegistrationRequest(
        name="Test User",
        email="test@example.com",
        password="securepassword",
        role="customer"
    )

    # Act
    profile_response = register_new_user_workflow(registration_request, user_repository)

    # Assert
    assert profile_response.name == "Test User"
    assert profile_response.email == "test@example.com"
    assert profile_response.role == "customer"
    
    # Verify database insertion
    saved_user = user_repository.retrieve_user_by_email("test@example.com")
    assert saved_user is not None
    assert saved_user.name == "Test User"
    # Ensure password is not saved in plain text
    assert saved_user.password_hash != "securepassword"

def test_user_registration_raises_error_for_duplicate_email(database_session):
    # Arrange
    user_repository = UserRepository(database_session)
    registration_request = UserRegistrationRequest(
        name="Test User",
        email="duplicate@example.com",
        password="securepassword1",
        role="customer"
    )
    register_new_user_workflow(registration_request, user_repository)

    # Act & Assert
    with pytest.raises(EmailAddressAlreadyRegisteredError):
        register_new_user_workflow(registration_request, user_repository)

def test_authenticate_user_succeeds_with_valid_credentials(database_session):
    # Arrange
    user_repository = UserRepository(database_session)
    registration_request = UserRegistrationRequest(
        name="Login User",
        email="login@example.com",
        password="correctpassword",
        role="customer"
    )
    register_new_user_workflow(registration_request, user_repository)

    login_request = UserLoginRequest(
        email="login@example.com",
        password="correctpassword"
    )

    # Act
    authentication_result = authenticate_user_credentials_workflow(login_request, user_repository)

    # Assert
    assert authentication_result.access_token is not None
    assert authentication_result.user.email == "login@example.com"

def test_authenticate_user_fails_with_invalid_credentials(database_session):
    # Arrange
    user_repository = UserRepository(database_session)
    registration_request = UserRegistrationRequest(
        name="Login User",
        email="login@example.com",
        password="correctpassword",
        role="customer"
    )
    register_new_user_workflow(registration_request, user_repository)

    # Act & Assert
    # 1. Invalid Email
    with pytest.raises(InvalidCredentialsError):
        authenticate_user_credentials_workflow(
            UserLoginRequest(email="wrong@example.com", password="correctpassword"),
            user_repository
        )

    # 2. Invalid Password
    with pytest.raises(InvalidCredentialsError):
        authenticate_user_credentials_workflow(
            UserLoginRequest(email="login@example.com", password="wrongpassword"),
            user_repository
        )
