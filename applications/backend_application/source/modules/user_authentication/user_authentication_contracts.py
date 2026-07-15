from pydantic import BaseModel, EmailStr, Field

class UserRegistrationRequest(BaseModel):
    """
    Contract representing the input data required for registering a new user.
    """
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    role: str = Field("customer", pattern="^(admin|customer)$", description="Role allowed: admin or customer")

class UserLoginRequest(BaseModel):
    """
    Contract representing the input credentials for logging in a user.
    """
    email: EmailStr
    password: str

class UserProfileResponse(BaseModel):
    """
    Contract representing public user profile information.
    """
    id: int
    name: str
    email: EmailStr
    role: str

class SuccessfulAuthenticationResponse(BaseModel):
    """
    Contract containing the generated access token and profile details upon successful login.
    """
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse
