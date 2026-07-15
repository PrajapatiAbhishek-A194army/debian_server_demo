from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from source.shared_backend_infrastructure.database.database_connection import yield_database_session
from source.shared_backend_infrastructure.security.json_web_token_utilities import (
    decode_and_validate_user_access_token,
    InvalidTokenError
)
from source.modules.user_authentication.user_authentication_contracts import (
    UserRegistrationRequest,
    UserLoginRequest,
    UserProfileResponse,
    SuccessfulAuthenticationResponse
)
from source.modules.user_authentication.user_repository import UserRepository
from source.modules.user_authentication.user_authentication_workflows import (
    register_new_user_workflow,
    authenticate_user_credentials_workflow,
    EmailAddressAlreadyRegisteredError,
    InvalidCredentialsError
)
from source.modules.user_authentication.user_database_model import UserDatabaseModel

user_authentication_router = APIRouter(
    prefix="/api/v1/user-authentication", 
    tags=["User Authentication"]
)

security_bearer_scheme = HTTPBearer()

def get_current_authenticated_user(
    authorization_credentials: HTTPAuthorizationCredentials = Depends(security_bearer_scheme),
    database_session: Session = Depends(yield_database_session)
) -> UserDatabaseModel:
    """
    Dependency resolver that extracts the access token, validates it,
    and returns the corresponding authenticated User database instance.
    """
    access_token = authorization_credentials.credentials
    try:
        token_payload = decode_and_validate_user_access_token(access_token)
        user_identifier_str = token_payload.get("sub")
        if user_identifier_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token payload is missing subject identifier."
            )
        user_identifier = int(user_identifier_str)
    except (InvalidTokenError, ValueError) as token_validation_exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(token_validation_exception)
        )

    user_repository = UserRepository(database_session)
    user_database_record = user_repository.retrieve_user_by_id(user_identifier)
    if user_database_record is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The user account associated with this token does not exist."
        )
    return user_database_record

def get_current_administrator_user(
    current_user: UserDatabaseModel = Depends(get_current_authenticated_user)
) -> UserDatabaseModel:
    """
    Dependency resolver that checks if the currently authenticated user
    has administrative privileges.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges are required to perform this action."
        )
    return current_user

@user_authentication_router.post(
    "/register", 
    response_model=UserProfileResponse, 
    status_code=status.HTTP_201_CREATED
)
def register_user_endpoint(
    registration_request: UserRegistrationRequest,
    database_session: Session = Depends(yield_database_session)
) -> UserProfileResponse:
    """
    Endpoint to register a new user in the system.
    """
    user_repository = UserRepository(database_session)
    try:
        user_profile = register_new_user_workflow(registration_request, user_repository)
        return user_profile
    except EmailAddressAlreadyRegisteredError as email_conflict_exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(email_conflict_exception)
        )

@user_authentication_router.post(
    "/login", 
    response_model=SuccessfulAuthenticationResponse
)
def login_user_endpoint(
    login_request: UserLoginRequest,
    database_session: Session = Depends(yield_database_session)
) -> SuccessfulAuthenticationResponse:
    """
    Endpoint to authenticate user credentials and get a JWT token.
    """
    user_repository = UserRepository(database_session)
    try:
        authentication_result = authenticate_user_credentials_workflow(login_request, user_repository)
        return authentication_result
    except InvalidCredentialsError as invalid_credentials_exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(invalid_credentials_exception)
        )
