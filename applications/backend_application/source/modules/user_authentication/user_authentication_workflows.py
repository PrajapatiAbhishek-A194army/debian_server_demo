from source.modules.user_authentication.user_authentication_contracts import (
    UserRegistrationRequest,
    UserLoginRequest,
    UserProfileResponse,
    SuccessfulAuthenticationResponse
)
from source.modules.user_authentication.user_repository import UserRepository
from source.modules.user_authentication.user_database_model import UserDatabaseModel
from source.modules.user_authentication.password_hasher import (
    generate_encrypted_password_hash,
    verify_submitted_plain_text_password
)
from source.shared_backend_infrastructure.security.json_web_token_utilities import (
    generate_user_access_token
)

class EmailAddressAlreadyRegisteredError(Exception):
    """Raised when trying to register an email address that is already associated with an account."""
    pass

class InvalidCredentialsError(Exception):
    """Raised when authentication credentials do not match any active user account."""
    pass

def register_new_user_workflow(
    registration_request: UserRegistrationRequest, 
    user_repository: UserRepository
) -> UserProfileResponse:
    """
    Orchestrates the business process for registering a new user account.
    """
    existing_user_record = user_repository.retrieve_user_by_email(registration_request.email)
    if existing_user_record is not None:
        raise EmailAddressAlreadyRegisteredError(
            "An account with this email address already exists."
        )

    encrypted_password_hash = generate_encrypted_password_hash(registration_request.password)
    
    new_user_database_record = UserDatabaseModel(
        name=registration_request.name,
        email=registration_request.email,
        password_hash=encrypted_password_hash,
        role=registration_request.role
    )
    
    saved_user_record = user_repository.save_new_user(new_user_database_record)
    
    return UserProfileResponse(
        id=saved_user_record.id,
        name=saved_user_record.name,
        email=saved_user_record.email,
        role=saved_user_record.role
    )

def authenticate_user_credentials_workflow(
    login_request: UserLoginRequest, 
    user_repository: UserRepository
) -> SuccessfulAuthenticationResponse:
    """
    Orchestrates the verification of login credentials and generation of access tokens.
    """
    user_database_record = user_repository.retrieve_user_by_email(login_request.email)
    if user_database_record is None:
        raise InvalidCredentialsError("Invalid email address or password.")

    is_submitted_password_valid = verify_submitted_plain_text_password(
        login_request.password, 
        user_database_record.password_hash
    )
    if not is_submitted_password_valid:
        raise InvalidCredentialsError("Invalid email address or password.")

    access_token = generate_user_access_token(
        user_database_record.id, 
        user_database_record.role
    )
    
    return SuccessfulAuthenticationResponse(
        access_token=access_token,
        user=UserProfileResponse(
            id=user_database_record.id,
            name=user_database_record.name,
            email=user_database_record.email,
            role=user_database_record.role
        )
    )
