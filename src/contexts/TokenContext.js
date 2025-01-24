
// src/contexts/TokenContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserBalances } from '../services/api'; // Updated import

const TokenContext = createContext();

/**
 * Provides token and sweepstakes balances to the component tree.
 */
export const TokenProvider = ({ children }) => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [sweepstakesBalance, setSweepstakesBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches the user's balances and updates the state.
   */
  const fetchBalances = async () => {
    setLoading(true);
    setError(null);
    try {
      const { tokenBalance, sweepstakesBalance } = await getUserBalances();
      setTokenBalance(tokenBalance);
      setSweepstakesBalance(sweepstakesBalance);
    } catch (err) {
      console.error('Failed to fetch balances:', err);
      setError('Failed to load balances. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
    // Optionally, set up polling or websocket listeners to update balances in real-time
  }, []);

  /**
   * Updates the token balance (e.g., after placing a bet).
   * @param {number} newBalance - The updated token balance.
   */
  const updateTokenBalance = (newBalance) => {
    setTokenBalance(newBalance);
  };

  /**
   * Updates the sweepstakes balance (e.g., after placing a bet).
   * @param {number} newBalance - The updated sweepstakes balance.
   */
  const updateSweepstakesBalance = (newBalance) => {
    setSweepstakesBalance(newBalance);
  };

  return (
    <TokenContext.Provider
      value={{
        tokenBalance,
        sweepstakesBalance,
        loading,
        error,
        fetchBalances,
        updateTokenBalance,
        updateSweepstakesBalance,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

/**
 * Custom hook to access token context.
 * @returns {object} - The token context value.
 */
export const useToken = () => useContext(TokenContext);

