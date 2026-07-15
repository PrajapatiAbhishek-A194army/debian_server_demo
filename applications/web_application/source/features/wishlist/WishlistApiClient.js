const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthenticationHeaders = () => {
  const storedToken = localStorage.getItem('token');
  return storedToken ? { 'Authorization': `Bearer ${storedToken}` } : {};
};

class WishlistApiClient {
  /**
   * Retrieves the current user's wishlist.
   */
  async retrieveWishlist() {
    const requestOptions = {
      method: 'GET',
      headers: getAuthenticationHeaders()
    };
    const response = await fetch(`${API_URL}/api/v1/wishlist`, requestOptions);
    if (!response.ok) {
      throw new Error('Failed to retrieve wishlist.');
    }
    return await response.json();
  }

  /**
   * Adds an item to the wishlist.
   */
  async addToWishlist(shoeId) {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthenticationHeaders()
      },
      body: JSON.stringify({ shoe_id: shoeId })
    };
    const response = await fetch(`${API_URL}/api/v1/wishlist`, requestOptions);
    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.detail || 'Failed to add item to wishlist.');
    }
    return await response.json();
  }

  /**
   * Removes an item from the wishlist.
   */
  async removeFromWishlist(wishlistItemId) {
    const requestOptions = {
      method: 'DELETE',
      headers: getAuthenticationHeaders()
    };
    const response = await fetch(`${API_URL}/api/v1/wishlist/${wishlistItemId}`, requestOptions);
    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.detail || 'Failed to remove item from wishlist.');
    }
    return true;
  }
}

export default new WishlistApiClient();
