// src/features/profile/components/Account.js

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaChessKnight, FaLink, FaPlus, FaUnlink, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from 'features/auth/contexts/AuthContext';
import { getUserLichessInfo } from 'features/auth/services/api';
import LichessInfo from './LichessInfo';
import DisconnectLichess from 'features/auth/components/DisconnectLichess';
import { ApiError } from '../../common/components/ApiError';
import './Account.css';

const Account = () => {
  const { token } = useAuth();
  const [lichessInfo, setLichessInfo] = useState(null);
  const [loadingLichess, setLoadingLichess] = useState(false);
  const [errorLichess, setErrorLichess] = useState(null);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const fetchLichessInfo = async () => {
    setLoadingLichess(true);
    setErrorLichess(null);
    try {
      if (!token) {
        throw new Error('Please log in to view your Lichess information.');
      }
      const data = await getUserLichessInfo(token);
      console.log('Received Lichess Info:', data);
      setLichessInfo(data);
    } catch (error) {
      // If error status is 404, user may simply not have connected a Lichess account
      if (error.status === 404) {
        setLichessInfo(null);
      } else {
        setErrorLichess({ code: 'LICHESS_ERROR', message: error.message || 'Failed to fetch Lichess information.' });
      }
    } finally {
      setLoadingLichess(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLichessInfo();
    } else {
      setLichessInfo(null);
      setErrorLichess(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, window.location.search]);

  const handleLichessChange = () => {
    fetchLichessInfo();
  };

  return (
    <motion.div 
      className="account-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2 
        className="account-title"
        variants={itemVariants}
      >
        Account Settings
      </motion.h2>
      
      <motion.div 
        className="account-section lichess-section"
        variants={itemVariants}
      >
        <div className="section-header">
          <div className="section-title">
            <FaChessKnight className="section-icon" />
            <h3>Lichess Integration</h3>
          </div>
          {lichessInfo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="connection-badge"
            >
              <span className="dot"></span>
              Connected
            </motion.div>
          )}
        </div>
        
        <div className="section-content">
          {loadingLichess ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading Lichess information...</p>
            </div>
          ) : errorLichess && !lichessInfo ? (
            <motion.div 
              className="error-container"
              variants={itemVariants}
            >
              <ApiError 
                error={errorLichess} 
                onDismiss={() => setErrorLichess(null)}
                compact 
              />
            </motion.div>
          ) : lichessInfo ? (
            <motion.div 
              className="lichess-info-container"
              variants={itemVariants}
            >
              <LichessInfo info={lichessInfo} />
              <motion.div 
                className="disconnect-container"
                variants={itemVariants}
              >
                <DisconnectLichess onDisconnect={handleLichessChange} />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              className="connect-lichess-container"
              variants={itemVariants}
            >
              <div className="empty-state">
                <FaUnlink className="empty-icon" />
                <p className="empty-text">
                  Your Lichess account is not connected. Connect your account to access exclusive features.
                </p>
                <motion.button 
                  className="connect-button"
                  whileHover={{ scale: 1.05, backgroundColor: "var(--color-secondary-light)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/connect/lichess'}
                >
                  <FaLink className="button-icon" />
                  Connect Lichess Account
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Additional Account Settings - For future implementation */}
      <motion.div 
        className="account-section additional-settings"
        variants={itemVariants}
      >
        <div className="section-header">
          <div className="section-title">
            <FaPlus className="section-icon" />
            <h3>Additional Settings</h3>
          </div>
        </div>
        
        <div className="section-content">
          <div className="coming-soon">
            <p>Additional account settings will be available soon!</p>
          </div>
        </div>
      </motion.div>
      
      {/* Account Security Section - For future implementation */}
      <motion.div 
        className="account-section security-section"
        variants={itemVariants}
      >
        <div className="section-header">
          <div className="section-title">
            <FaExclamationTriangle className="section-icon" />
            <h3>Account Security</h3>
          </div>
        </div>
        
        <div className="section-content">
          <div className="coming-soon">
            <p>Security settings will be available soon!</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Account;
