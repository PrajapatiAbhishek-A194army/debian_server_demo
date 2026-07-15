const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthenticationHeaders = () => {
  const storedToken = localStorage.getItem('token');
  return storedToken ? { 'Authorization': `Bearer ${storedToken}` } : {};
};

class ShoppingCartApiClient {
  /**
   * Retrieves the current customer's shopping cart.
   */
  async retrieveCart() {
    const requestOptions = {
      method: 'GET',
      headers: getAuthenticationHeaders()
    };
    const response = await fetch(`${API_URL}/api/v1/shopping-cart`, requestOptions);
    if (!response.ok) {
      throw new Error('Failed to retrieve shopping cart.');
    }
    return await response.json();
  }

  /**
   * Adds an item to the shopping cart.
   */
  async addToCart(shoeId, quantity = 1) {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthenticationHeaders()
      },
      body: JSON.stringify({ shoe_id: shoeId, quantity })
    };
    const response = await fetch(`${API_URL}/api/v1/shopping-cart`, requestOptions);
    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.detail || 'Failed to add item to cart.');
    }
    return await response.json();
  }

  /**
   * Updates the quantity of a cart item.
   */
  async updateQuantity(cartItemId, quantity) {
    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthenticationHeaders()
      },
      body: JSON.stringify({ quantity })
    };
    const response = await fetch(`${API_URL}/api/v1/shopping-cart/${cartItemId}`, requestOptions);
    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.detail || 'Failed to update item quantity.');
    }
    return await response.json();
  }

  /**
   * Removes an item from the cart.
   */
  async removeFromCart(cartItemId) {
    const requestOptions = {
      method: 'DELETE',
      headers: getAuthenticationHeaders()
    };
    const response = await fetch(`${API_URL}/api/v1/shopping-cart/${cartItemId}`, requestOptions);
    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.detail || 'Failed to remove item from cart.');
    }
    return true;
  }

  /**
   * Clears the user's cart.
   */
  async clearCart() {
    const requestOptions = {
      method: 'DELETE',
      headers: getAuthenticationHeaders()
    };
    const response = await fetch(`${API_URL}/api/v1/shopping-cart`, requestOptions);
    if (!response.ok) {
      throw new Error('Failed to clear shopping cart.');
    }
    return true;
  }
}

export default new ShoppingCartApiClient();
