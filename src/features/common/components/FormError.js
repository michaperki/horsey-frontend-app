// src/features/common/components/FormError.js
import React from 'react';
import PropTypes from 'prop-types';
import { FaExclamationTriangle } from 'react-icons/fa';
import './FormError.css';

/**
 * FormError is a specialized component for displaying form validation errors.
 * It can handle both single error messages and object-based validation errors
 * with field-specific messages.
 */
export const FormError = ({ 
  error, 
  field = null, 
  className = '', 
  showIcon = true 
}) => {
  // Early return if no error
  if (!error) return null;
  
  // Case 1: Simple string error that might apply to a specific field
  if (typeof error === 'string') {
    return (
      <div className={`form-error ${className}`}>
        {showIcon && <FaExclamationTriangle className="form-error-icon" />}
        <span>{error}</span>
      </div>
    );
  }
  
  // Case 2: Error object with code and message (from API)
  if (error.message && (!field || !error.validationErrors)) {
    return (
      <div className={`form-error ${className}`}>
        {showIcon && <FaExclamationTriangle className="form-error-icon" />}
        <span>{error.message}</span>
      </div>
    );
  }
  
  // Case 3: Error object with validationErrors property (e.g., from backend)
  if (error.validationErrors) {
    // If a specific field is requested, show only that field's error
    if (field && error.validationErrors[field]) {
      return (
        <div className={`form-error ${className}`}>
          {showIcon && <FaExclamationTriangle className="form-error-icon" />}
          <span>{error.validationErrors[field]}</span>
        </div>
      );
    } 
    
    // If no specific field requested, show all validation errors as a list
    else if (!field && Object.keys(error.validationErrors).length > 0) {
      return (
        <div className={`form-error-list ${className}`}>
          {showIcon && <FaExclamationTriangle className="form-error-icon" />}
          <ul>
            {Object.entries(error.validationErrors).map(([fieldName, message]) => (
              <li key={fieldName}>
                <strong>{formatFieldName(fieldName)}:</strong> {message}
              </li>
            ))}
          </ul>
        </div>
      );
    }
  }
  
  // Case 4: Fields object with individual fields having errors (for local form validation)
  if (!field && typeof error === 'object' && !error.message) {
    const errorFields = Object.entries(error).filter(([_, v]) => !!v);
    if (errorFields.length > 0) {
      return (
        <div className={`form-error-list ${className}`}>
          {showIcon && <FaExclamationTriangle className="form-error-icon" />}
          <ul>
            {errorFields.map(([fieldName, message]) => (
              <li key={fieldName}>
                <strong>{formatFieldName(fieldName)}:</strong> {message}
              </li>
            ))}
          </ul>
        </div>
      );
    }
  }
  
  // Default case - return null if no matching error format
  return null;
};

// Helper to format field names for display (convert camelCase to Title Case)
const formatFieldName = (fieldName) => {
  // Convert camelCase to space-separated words
  const name = fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  
  // Special case for common abbreviations
  return name
    .replace(/\bId\b/g, 'ID')
    .replace(/\bUrl\b/g, 'URL')
    .replace(/\bApi\b/g, 'API');
};

FormError.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  field: PropTypes.string,
  className: PropTypes.string,
  showIcon: PropTypes.bool
};

export default FormError;
