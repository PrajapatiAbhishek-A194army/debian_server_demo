const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class UserAuthenticationApiClient {
  /**
   * Registers a new user.
   */
  async register(name, email, password, role = 'customer') {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    };
    
    const response = await fetch(`${API_URL}/api/v1/user-authentication/register`, requestOptions);
    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.detail || 'Failed to register account.');
    }
    return await response.json();
  }

  /**
   * Logins and obtains a JWT access token.
   */
  async login(email, password) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    };
    
    const response = await fetch(`${API_URL}/api/v1/user-authentication/login`, requestOptions);
    if (!response.ok) {
      const errorPayload = await response.json();
      throw new Error(errorPayload.detail || 'Invalid credentials or login failed.');
    }
    return await response.json();
  }
}

export default new UserAuthenticationApiClient();
