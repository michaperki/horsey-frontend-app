// src/features/common/components/ApiError.js
import React from 'react';
import PropTypes from 'prop-types';
import { FaExclamationCircle, FaTimes, FaRedo, FaInfoCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './ApiError.css'; // We'll create this next

/**
 * ApiError is a reusable component for displaying API errors in a consistent way
 * across the application. It supports displaying different types of errors with
 * appropriate styling and optional retry functionality.
 */
export const ApiError = ({ 
  error, 
  onDismiss, 
  onRetry, 
  className = '',
  showDetails = false,
  compact = false
}) => {
  if (!error) return null;
  
  const errorCode = error.code || 'UNKNOWN_ERROR';
  const message = error.message || getErrorMessage(errorCode);
  
  // Determine error severity based on code or status
  let severity = 'error';
  if (errorCode.includes('VALIDATION') || error.status === 400) {
    severity = 'warning';
  } else if (errorCode.includes('INFO') || errorCode.includes('NOT_FOUND')) {
    severity = 'info';
  }
  
  return (
    <AnimatePresence>
      <motion.div 
        className={`api-error ${severity} ${compact ? 'compact' : ''} ${className}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
      >
        <div className="error-icon">
          <FaExclamationCircle />
        </div>
        
        <div className="error-content">
          <div className="error-message">{message}</div>
          
          {showDetails && process.env.NODE_ENV === 'development' && (
            <details className="error-details">
              <summary>
                <FaInfoCircle /> Error Details
              </summary>
              <div className="details-content">
                <p><strong>Code:</strong> {errorCode}</p>
                {error.status && <p><strong>Status:</strong> {error.status}</p>}
                {error.data && (
                  <pre>{JSON.stringify(error.data, null, 2)}</pre>
                )}
              </div>
            </details>
          )}
        </div>
        
        <div className="error-actions">
          {onRetry && (
            <button 
              onClick={onRetry} 
              className="error-retry"
              aria-label="Retry"
            >
              <FaRedo />
            </button>
          )}
          
          {onDismiss && (
            <button 
              onClick={onDismiss} 
              className="error-dismiss"
              aria-label="Dismiss"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Helper function to get appropriate error message
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'NETWORK_ERROR': 'Unable to connect to the server. Please check your internet connection.',
    'AUTH_ERROR': 'Authentication failed. Please log in again.',
    'PERMISSION_ERROR': 'You don\'t have permission to perform this action.',
    'VALIDATION_ERROR': 'Please check your input and try again.',
    'NOT_FOUND_ERROR': 'The requested resource was not found.',
    'SERVER_ERROR': 'Something went wrong on our end. Please try again later.',
    'DATABASE_ERROR': 'Database operation failed. Please try again later.',
    'RATE_LIMIT_ERROR': 'Too many requests. Please try again later.',
    'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
  };
  
  return errorMessages[errorCode] || errorMessages.UNKNOWN_ERROR;
};

ApiError.propTypes = {
  error: PropTypes.shape({
    code: PropTypes.string,
    message: PropTypes.string,
    status: PropTypes.number,
    data: PropTypes.any
  }),
  onDismiss: PropTypes.func,
  onRetry: PropTypes.func,
  className: PropTypes.string,
  showDetails: PropTypes.bool,
  compact: PropTypes.bool
};

export default ApiError;
