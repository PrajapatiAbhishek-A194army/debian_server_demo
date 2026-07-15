from pydantic import BaseModel, Field
from typing import List, Optional

class AddCartItemRequest(BaseModel):
    """
    Contract representing the input to add an item to the shopping cart.
    """
    shoe_id: int = Field(..., description="The identifier of the shoe item.")
    quantity: int = Field(1, gt=0, description="The quantity must be at least 1.")

class UpdateCartItemQuantityRequest(BaseModel):
    """
    Contract representing the input to update the quantity of a cart item.
    """
    quantity: int = Field(..., gt=0, description="The quantity must be at least 1.")

class CartItemDetailsResponse(BaseModel):
    """
    Contract representing a detailed cart item line with product and pricing details.
    """
    id: int
    shoe_id: int
    name: str
    brand: str
    price: float
    quantity: int
    image_url: Optional[str]
    subtotal: float

class ShoppingCartSummaryResponse(BaseModel):
    """
    Contract representing the aggregated list of cart items and the final cart total price.
    """
    items: List[CartItemDetailsResponse]
    total_amount: float
