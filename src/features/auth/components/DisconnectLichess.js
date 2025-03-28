// src/features/auth/components/DisconnectLichess.js - Updated with Error Handling

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { disconnectLichessAccount } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../../common/components/ApiError';
import { useApiError } from '../../common/contexts/ApiErrorContext';
import { FaChess, FaUnlink, FaSpinner } from 'react-icons/fa';
import './DisconnectLichess.css';

const DisconnectLichess = ({ onDisconnect }) => {
  const { token } = useAuth();
  const { handleApiError } = useApiError();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // First step - show confirmation dialog
  const initiateDisconnect = () => {
    if (!token) {
      setError({
        code: 'AUTH_ERROR',
        message: 'Please log in to disconnect your Lichess account.'
      });
      return;
    }

    setShowConfirm(true);
  };

  // Second step - actually disconnect
  const handleDisconnect = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use handleApiError to wrap API call
      const disconnectWithHandling = handleApiError(disconnectLichessAccount, {
        showGlobalError: false,
        onError: (err) => setError(err),
        onSuccess: () => {
          // Call the callback if provided
          if (onDisconnect) {
            onDisconnect();
          }
          // Hide the confirmation dialog
          setShowConfirm(false);
        }
      });
      
      await disconnectWithHandling();
    } catch (err) {
      // Error is handled by handleApiError
    } finally {
      setLoading(false);
    }
  };

  // Cancel the disconnect action
  const handleCancel = () => {
    setShowConfirm(false);
    setError(null);
  };

  // Animation variants
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  const confirmVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="disconnect-lichess-container">
      {/* Display any API errors */}
      {error && (
        <div className="disconnect-error-container">
          <ApiError 
            error={error} 
            onDismiss={() => setError(null)}
            compact={true}
          />
        </div>
      )}
      
      {/* Initial disconnect button */}
      {!showConfirm && (
        <motion.button 
          onClick={initiateDisconnect}
          className="disconnect-button"
          disabled={loading}
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          <FaUnlink className="disconnect-icon" />
          Disconnect Lichess
        </motion.button>
      )}
      
      {/* Confirmation dialog */}
      {showConfirm && (
        <motion.div 
          className="disconnect-confirm"
          variants={confirmVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="confirm-icon">
            <FaChess />
          </div>
          <h3>Confirm Disconnect</h3>
          <p>Are you sure you want to disconnect your Lichess account? This action cannot be undone.</p>
          
          <div className="confirm-actions">
            <motion.button 
              onClick={handleCancel}
              className="cancel-button"
              disabled={loading}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Cancel
            </motion.button>
            
            <motion.button 
              onClick={handleDisconnect}
              className="confirm-button"
              disabled={loading}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {loading ? (
                <>
                  <FaSpinner className="spinner" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <FaUnlink className="disconnect-icon" />
                  Disconnect
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

DisconnectLichess.propTypes = {
  onDisconnect: PropTypes.func,
};

export default DisconnectLichess;
