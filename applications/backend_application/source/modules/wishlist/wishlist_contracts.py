from pydantic import BaseModel, Field
from typing import Optional

class AddWishlistItemRequest(BaseModel):
    """
    Contract representing the input to add an item to the wishlist.
    """
    shoe_id: int = Field(..., description="The identifier of the shoe catalog item.")

class WishlistItemDetailsResponse(BaseModel):
    """
    Contract representing a detailed wishlist item line.
    """
    id: int
    shoe_id: int
    name: str
    brand: str
    price: float
    image_url: Optional[str]
