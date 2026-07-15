import React, { createContext, useState, useEffect, useContext } from 'react';
import UserAuthenticationApiClient from './UserAuthenticationApiClient';

const AuthenticationContext = createContext(null);

export const UserAuthenticationProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token and user info are already persisted in localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (parseException) {
        // Clear broken localStorage state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const response = await UserAuthenticationApiClient.login(email, password);
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response.user;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (name, email, password, role = 'customer') => {
    setLoading(true);
    try {
      return await UserAuthenticationApiClient.register(name, email, password, role);
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthenticationContext.Provider value={{ user, token, isAuthenticated: !!token, loading, loginUser, registerUser, logoutUser }}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuthentication = () => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error('useAuthentication must be used within a UserAuthenticationProvider');
  }
  return context;
};
