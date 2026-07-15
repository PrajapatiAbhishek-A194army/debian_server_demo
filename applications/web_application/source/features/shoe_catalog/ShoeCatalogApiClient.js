const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthenticationHeaders = () => {
  const storedToken = localStorage.getItem('token');
  return storedToken ? { 'Authorization': `Bearer ${storedToken}` } : {};
};

class ShoeCatalogApiClient {
  /**
   * Retrieves a list of shoes matching the search query, brand, size, and price filters.
   */
  async retrieveShoes(filters = {}) {
    const urlParameters = new URLSearchParams();
    if (filters.brand) urlParameters.append('brand', filters.brand);
    if (filters.size) urlParameters.append('size', filters.size);
    if (filters.minimumPrice) urlParameters.append('minimum_price', filters.minimumPrice);
    if (filters.maximumPrice) urlParameters.append('maximum_price', filters.maximumPrice);
    if (filters.searchQuery) urlParameters.append('search_query', filters.searchQuery);

    const response = await fetch(`${API_URL}/api/v1/shoe-catalog?${urlParameters.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to retrieve shoe catalog.');
    }
    return await response.json();
  }

  /**
   * Retrieves a single shoe by ID.
   */
  async retrieveShoeById(shoeIdentifier) {
    const response = await fetch(`${API_URL}/api/v1/shoe-catalog/${shoeIdentifier}`);
    if (!response.ok) {
      throw new Error('Failed to retrieve shoe details.');
    }
    return await response.json();
  }

  /**
   * Creates a new shoe catalog item (Admin only).
   */
  async createShoe(shoeData) {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthenticationHeaders()
      },
      body: JSON.stringify(shoeData)
    };

    const response = await fetch(`${API_URL}/api/v1/shoe-catalog`, requestOptions);
    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.detail || 'Failed to create shoe catalog record.');
    }
    return await response.json();
  }

  /**
   * Updates an existing shoe catalog item (Admin only).
   */
  async modifyShoe(shoeIdentifier, shoeData) {
    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthenticationHeaders()
      },
      body: JSON.stringify(shoeData)
    };

    const response = await fetch(`${API_URL}/api/v1/shoe-catalog/${shoeIdentifier}`, requestOptions);
    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.detail || 'Failed to update shoe catalog record.');
    }
    return await response.json();
  }

  /**
   * Deletes a shoe from the catalog (Admin only).
   */
  async deleteShoe(shoeIdentifier) {
    const requestOptions = {
      method: 'DELETE',
      headers: getAuthenticationHeaders()
    };

    const response = await fetch(`${API_URL}/api/v1/shoe-catalog/${shoeIdentifier}`, requestOptions);
    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.detail || 'Failed to delete shoe catalog record.');
    }
    return true;
  }
}

export default new ShoeCatalogApiClient();
