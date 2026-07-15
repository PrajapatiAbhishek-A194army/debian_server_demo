from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class VerifyPaymentRequest(BaseModel):
    """
    Contract representing the Razorpay payment confirmation details.
    """
    razorpay_order_id: str = Field(..., description="The transaction order identifier returned by Razorpay.")
    razorpay_payment_id: str = Field(..., description="The individual payment identifier returned by Razorpay.")
    razorpay_signature: str = Field(..., description="The signature computed by Razorpay to verify token authenticity.")

class OrderLineItemResponse(BaseModel):
    """
    Contract representing an individual item line in a past order history.
    """
    id: int
    shoe_id: Optional[int]
    shoe_name: Optional[str]
    brand: Optional[str]
    quantity: int
    price: float

class OrderDetailsResponse(BaseModel):
    """
    Contract representing detailed order transaction information.
    """
    id: int
    customer_id: int
    total_amount: float
    payment_status: str
    razorpay_order_id: Optional[str]
    created_at: datetime
    line_items: List[OrderLineItemResponse]

class CheckoutInitializationResponse(BaseModel):
    """
    Contract returned to the frontend client to initialize the Razorpay checkout overlay.
    """
    order_id: int = Field(..., description="The system internal order identifier.")
    razorpay_order_id: str = Field(..., description="The Razorpay transaction order ID.")
    amount: float = Field(..., description="The amount to be collected in INR.")
    currency: str = "INR"
    key_id: str = Field(..., description="The active Razorpay Key ID to use in frontend SDK.")
