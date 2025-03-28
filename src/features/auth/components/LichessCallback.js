// src/features/auth/components/LichessCallback.js - Updated with Error Handling

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { lichessCallback } from '../services/api';
import { ApiError } from '../../common/components/ApiError';
import { useApiError } from '../../common/contexts/ApiErrorContext';
import { FaChessKnight, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import './LichessCallback.css'

const LichessCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleApiError } = useApiError();
  
  const [message, setMessage] = useState('Processing your connection...');
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const handleCallback = async () => {
      const queryParams = new URLSearchParams(location.search);
      const code = queryParams.get('code');
      const state = queryParams.get('state');

      if (!code) {
        setStatus('error');
        setError({
          code: 'INVALID_REQUEST',
          message: 'Authorization code not found. Please try connecting again.'
        });
        return;
      }

      try {
        // Use handleApiError wrapper for error handling
        const callbackWithHandling = handleApiError(lichessCallback, {
          showGlobalError: false,
          onError: (err) => {
            setStatus('error');
            setError(err);
          }
        });
        
        await callbackWithHandling({ code, state });
        
        // Set success state
        setStatus('success');
        setMessage('Lichess account connected successfully!');
        
        // Start countdown to redirect
        let count = 3;
        setCountdown(count);
        const timer = setInterval(() => {
          count -= 1;
          setCountdown(count);
          if (count <= 0) {
            clearInterval(timer);
            navigate('/profile');
          }
        }, 1000);
        
        // Clean up timer
        return () => clearInterval(timer);
      } catch (error) {
        // Error is handled by handleApiError
        console.error('Error handling Lichess callback:', error);
      }
    };

    handleCallback();
  }, [location, navigate, handleApiError]);

  // Handle manual navigation after error
  const handleNavigateToProfile = () => {
    navigate('/profile');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="lichess-callback-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="lichess-callback-card">
        <div className="lichess-callback-header">
          <FaChessKnight className="lichess-icon" />
          <h2>Lichess Connection</h2>
        </div>
        
        {status === 'loading' && (
          <div className="lichess-callback-loading">
            <div className="spinner"></div>
            <p>{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="lichess-callback-success">
            <FaCheckCircle className="success-icon" />
            <p>{message}</p>
            <p className="redirect-message">
              Redirecting to profile in {countdown} seconds...
            </p>
            <button
              onClick={handleNavigateToProfile}
              className="redirect-button"
            >
              Go to Profile Now <FaArrowRight />
            </button>
          </div>
        )}
        
        {status === 'error' && (
          <div className="lichess-callback-error">
            <ApiError 
              error={error} 
              onDismiss={() => setError(null)}
            />
            <button
              onClick={handleNavigateToProfile}
              className="redirect-button mt-4"
            >
              Return to Profile <FaArrowRight />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LichessCallback;
