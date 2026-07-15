import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
import jwt

# Fetch JWT parameters from environments
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super_secret_jwt_signing_key_for_local_development_2026")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
TOKEN_EXPIRATION_MINUTES = 60

class InvalidTokenError(Exception):
    """Raised when the provided access token is expired, invalidly signed, or malformed."""
    pass

def generate_user_access_token(user_identifier: int, user_role: str) -> str:
    """
    Generates a JWT access token for a given user identifier and role.
    """
    token_expiration_datetime = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRATION_MINUTES)
    token_payload = {
        "sub": str(user_identifier),
        "role": user_role,
        "exp": token_expiration_datetime
    }
    encoded_access_token = jwt.encode(token_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_access_token

def decode_and_validate_user_access_token(access_token: str) -> Dict[str, Any]:
    """
    Decodes the given access token and verifies its validity and signature.
    Returns the decoded token payload.
    Raises InvalidTokenError if the token is invalid or expired.
    """
    try:
        decoded_payload = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return decoded_payload
    except jwt.ExpiredSignatureError as expired_exception:
        raise InvalidTokenError("The access token has expired.") from expired_exception
    except jwt.InvalidTokenError as invalid_token_exception:
        raise InvalidTokenError("The access token is invalid.") from invalid_token_exception
