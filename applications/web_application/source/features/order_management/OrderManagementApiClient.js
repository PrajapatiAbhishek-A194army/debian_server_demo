const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthenticationHeaders = () => {
  const storedToken = localStorage.getItem('token');
  return storedToken ? { 'Authorization': `Bearer ${storedToken}` } : {};
};

class OrderManagementApiClient {
  /**
   * Initializes order checkout to secure a Razorpay order.
   */
  async checkout() {
    const requestOptions = {
      method: 'POST',
      headers: getAuthenticationHeaders()
    };
    const response = await fetch(`${API_URL}/api/v1/order-management/checkout`, requestOptions);
    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.detail || 'Failed to initialize checkout.');
    }
    return await response.json();
  }

  /**
   * Verifies Razorpay payment signature and completes transaction.
   */
  async verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthenticationHeaders()
      },
      body: JSON.stringify({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature
      })
    };
    const response = await fetch(`${API_URL}/api/v1/order-management/verify-payment`, requestOptions);
    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.detail || 'Payment signature verification failed.');
    }
    return await response.json();
  }

  /**
   * Retrieves past orders for the logged-in customer.
   */
  async retrieveOrderHistory() {
    const requestOptions = {
      method: 'GET',
      headers: getAuthenticationHeaders()
    };
    const response = await fetch(`${API_URL}/api/v1/order-management/history`, requestOptions);
    if (!response.ok) {
      throw new Error('Failed to retrieve order history.');
    }
    return await response.json();
  }

  /**
   * Retrieves all orders in the system (Admin only).
   */
  async retrieveAllOrdersForAdmin() {
    const requestOptions = {
      method: 'GET',
      headers: getAuthenticationHeaders()
    };
    const response = await fetch(`${API_URL}/api/v1/order-management/admin/orders`, requestOptions);
    if (!response.ok) {
      throw new Error('Failed to retrieve system order records.');
    }
    return await response.json();
  }
}

export default new OrderManagementApiClient();
