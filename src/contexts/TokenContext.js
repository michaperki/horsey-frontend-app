
// src/contexts/TokenContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserBalances } from '../services/api';
import { useAuth } from './AuthContext'; // Import AuthContext for user authentication check

const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
  const { user } = useAuth(); // Check if user is logged in
  const [tokenBalance, setTokenBalance] = useState(0);
  const [sweepstakesBalance, setSweepstakesBalance] = useState(0);
  const [loading, setLoading] = useState(false); // Default to false
  const [error, setError] = useState(null);

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
    if (user) {
      fetchBalances(); // Fetch balances only if the user is logged in
    }
  }, [user]); // Re-run when the user changes

  return (
    <TokenContext.Provider
      value={{
        tokenBalance,
        sweepstakesBalance,
        loading,
        error,
        fetchBalances,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => useContext(TokenContext);

