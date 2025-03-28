// src/features/common/contexts/ApiErrorContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import ApiError from '../components/ApiError';

// Create the context
const ApiErrorContext = createContext();

/**
 * Provider component for managing global API errors
 */
export const ApiErrorProvider = ({ children }) => {
  const [globalError, setGlobalError] = useState(null);
  
  // Clear the global error
  const clearError = useCallback(() => {
    setGlobalError(null);
  }, []);
  
  // Set a new global error
  const setError = useCallback((error) => {
    if (typeof error === 'string') {
      // Convert string to error object
      setGlobalError({
        message: error,
        code: 'CUSTOM_ERROR'
      });
    } else {
      setGlobalError(error);
    }
  }, []);
  
  // Handle errors from API calls
  const handleApiError = useCallback((apiCall, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      showGlobalError = true,
      transformError,
      retryCount = 0  // Add retry mechanism
    } = options;
    
    return async (...args) => {
      try {
        const result = await apiCall(...args);
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } catch (error) {
        // Add retry logic for network errors
        if (error.code === 'NETWORK_ERROR' && retryCount > 0) {
          // Implement retry logic here
        }
        
        // Transform error if transformer provided
        const processedError = transformError ? transformError(error) : error;
        
        // Call onError callback if provided
        if (onError) {
          onError(processedError);
        }
        
        // Show global error if requested
        if (showGlobalError) {
          setGlobalError(processedError);
        }
        
        throw processedError;
      }
    };
  }, []);
  
  return (
    <ApiErrorContext.Provider value={{ 
      globalError, 
      setError, 
      clearError,
      handleApiError
    }}>
      {children}
      
      {/* Render the global error if it exists */}
      {globalError && (
        <div className="global-error-container">
          <ApiError 
            error={globalError} 
            onDismiss={clearError}
          />
        </div>
      )}
    </ApiErrorContext.Provider>
  );
};

ApiErrorProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook for using the API error context
 */
export const useApiError = () => {
  const context = useContext(ApiErrorContext);
  
  if (!context) {
    throw new Error('useApiError must be used within an ApiErrorProvider');
  }
  
  return context;
};

/**
 * Higher-order component for wrapping a component with error handling
 */
export const withApiErrorHandling = (Component) => {
  const WrappedComponent = (props) => {
    const { handleApiError } = useApiError();
    
    return <Component {...props} handleApiError={handleApiError} />;
  };
  
  WrappedComponent.displayName = `WithApiErrorHandling(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
};
