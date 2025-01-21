
// src/contexts/TokenContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';

const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTokens = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to view your tokens.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/tokens/balance/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setTokens(data.balance);
      } else {
        setError(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Error fetching tokens:", err);
      setError("An unexpected error occurred while fetching tokens.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  return (
    <TokenContext.Provider value={{ tokens, setTokens, fetchTokens, loading, error }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => useContext(TokenContext);
