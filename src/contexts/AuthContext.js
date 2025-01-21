
// src/contexts/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Corrected import
import PropTypes from 'prop-types';

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component to wrap around the app
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  // Function to check token expiration
  const isTokenExpired = (decodedToken) => {
    if (!decodedToken.exp) return true; // If no exp claim, consider it expired
    const currentTime = Date.now() / 1000; // Current time in seconds
    return decodedToken.exp < currentTime;
  };

  // Decode token and set user
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        if (isTokenExpired(decoded)) {
          console.warn('Token has expired.');
          logout();
        } else {
          setUser(decoded);
          
          // Optional: Set a timeout to automatically logout when the token expires
          const timeout = (decoded.exp * 1000) - Date.now();
          const logoutTimer = setTimeout(() => {
            console.warn('Token expired. Logging out.');
            logout();
          }, timeout);
          
          // Clean up the timeout if the token changes or component unmounts
          return () => clearTimeout(logoutTimer);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token]);

  // Login function
  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

