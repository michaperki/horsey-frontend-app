// src/features/betting/contexts/BetContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useSocket } from '../../common/contexts/SocketContext';
import { getBetDetails } from '../services/api';

const BetContext = createContext();

export const BetProvider = ({ children }) => {
  const { token } = useAuth();
  const socket = useSocket();
  
  const [currentBet, setCurrentBet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch bet details by ID
  const fetchBet = useCallback(async (betId) => {
    if (!token || !betId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const betDetails = await getBetDetails(betId);
      setCurrentBet(betDetails);
    } catch (err) {
      console.error('Error fetching bet details:', err);
      setError(err.message || 'Failed to fetch bet details');
    } finally {
      setLoading(false);
    }
  }, [token]);
  
  // Clear current bet
  const clearBet = useCallback(() => {
    setCurrentBet(null);
  }, []);
  
  // Listen for bet outcome updates via socket
  useEffect(() => {
    if (!socket || !currentBet) return;
    
    const handleBetResolved = (data) => {
      if (data.betId === currentBet._id) {
        // Update bet with outcome
        setCurrentBet(prevBet => ({
          ...prevBet,
          status: data.status,
          outcome: data.outcome,
          ...(data.winnings && { winnings: data.winnings })
        }));
      }
    };
    
    socket.on('betResolved', handleBetResolved);
    
    return () => {
      socket.off('betResolved', handleBetResolved);
    };
  }, [socket, currentBet]);
  
  // Context value
  const value = {
    currentBet,
    loading,
    error,
    fetchBet,
    clearBet
  };
  
  return (
    <BetContext.Provider value={value}>
      {children}
    </BetContext.Provider>
  );
};

// Add prop-types validation
BetProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use the BetContext
export const useBet = () => {
  const context = useContext(BetContext);
  if (!context) {
    throw new Error('useBet must be used within a BetProvider');
  }
  return context;
};