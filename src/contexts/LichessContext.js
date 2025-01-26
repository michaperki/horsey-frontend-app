
// src/contexts/LichessContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLichessStatus, initiateLichessOAuth } from '../services/api';
import { useAuth } from './AuthContext';

const LichessContext = createContext();

export const LichessProvider = ({ children }) => {
  const { token, logout } = useAuth();
  const [lichessConnected, setLichessConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false); // For animation trigger

  const fetchLichessStatus = async () => {
    if (!token) {
      setLichessConnected(false);
      return;
    }

    setLoading(true);
    try {
      const isConnected = await getLichessStatus();
      setLichessConnected(isConnected);
    } catch (error) {
      console.error('Error fetching Lichess status:', error);
      if (error.message === 'Unauthorized') {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLichessStatus();
  }, [token]);

  const connectLichess = () => {
    initiateLichessOAuth();
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500); // Duration matches CSS animation
  };

  return (
    <LichessContext.Provider
      value={{
        lichessConnected,
        connectLichess,
        loading,
        triggerShake,
        shake,
      }}
    >
      {children}
    </LichessContext.Provider>
  );
};

export const useLichess = () => useContext(LichessContext);

