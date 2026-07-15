from pydantic import BaseModel, Field
from typing import Optional

class ShoeCreationRequest(BaseModel):
    """
    Contract for adding a new shoe to the catalog inventory.
    """
    name: str = Field(..., min_length=1, max_length=150)
    brand: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    price: float = Field(..., gt=0.0, description="The price of the shoe must be greater than zero.")
    size: float = Field(..., gt=0.0, description="The size must be a positive number.")
    stock_quantity: int = Field(..., ge=0, description="The stock quantity cannot be negative.")
    image_url: Optional[str] = None

class ShoeModificationRequest(BaseModel):
    """
    Contract for modifying an existing shoe in the catalog.
    All fields are optional.
    """
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    brand: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0.0)
    size: Optional[float] = Field(None, gt=0.0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None

class ShoeDetailsResponse(BaseModel):
    """
    Contract representing the detailed fields of a shoe catalog item.
    """
    id: int
    name: str
    brand: str
    description: Optional[str]
    price: float
    size: float
    stock_quantity: int
    image_url: Optional[str]
