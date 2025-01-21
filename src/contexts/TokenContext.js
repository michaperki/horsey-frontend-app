
// src/contexts/TokenContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserBalance } from '../services/api';

const TokenContext = createContext();

/**
 * Provides token-related data and actions to the component tree.
 */
export const TokenProvider = ({ children }) => {
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches the user's token balance and updates the state.
   */
  const fetchTokens = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view your tokens.');
      setLoading(false);
      return;
    }

    try {
      const balance = await getUserBalance();
      setTokens(balance);
    } catch (err) {
      setError(err.message || 'Failed to fetch tokens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TokenContext.Provider value={{ tokens, setTokens, fetchTokens, loading, error }}>
      {children}
    </TokenContext.Provider>
  );
};

/**
 * Custom hook to access token context.
 */
export const useToken = () => useContext(TokenContext);

