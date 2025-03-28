// src/contexts/LichessContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types'; // Import prop-types
import {
  initiateLichessOAuth,
  getLichessStatus,
  getUserLichessInfo
} from 'features/auth/services/api';
import { useAuth } from './AuthContext';

const LichessContext = createContext();

export const LichessProvider = ({ children }) => {
  const { token, logout } = useAuth();
  const [lichessConnected, setLichessConnected] = useState(false);
  const [lichessUsername, setLichessUsername] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const fetchLichessStatus = useCallback(async () => {
    if (!token) {
      setLichessConnected(false);
      setLichessUsername(null);
      return;
    }

    setLoading(true);
    try {
      const isConnected = await getLichessStatus();
      setLichessConnected(isConnected);

      if (isConnected) {
        const lichessInfo = await getUserLichessInfo();
        setLichessUsername(lichessInfo.username);
      }
    } catch (error) {
      console.error('Error fetching Lichess status:', error);
      if (error.message === 'Unauthorized') {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchLichessStatus();
  }, [fetchLichessStatus]);

  const connectLichess = () => {
    initiateLichessOAuth();
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <LichessContext.Provider
      value={{
        lichessConnected,
        lichessUsername,
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

// Add prop-types validation for children
LichessProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useLichess = () => useContext(LichessContext);
