// src/features/common/services/api.js - Enhanced for new error handling

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * Enhanced error processing function to handle the new centralized error format from backend
 * @param {Error} error - The error object from fetch
 * @param {string} fallbackMessage - Fallback message if error isn't properly formatted
 * @returns {Error} - Enhanced error object with standardized properties
 */
const processApiError = (error, fallbackMessage = 'An error occurred') => {
  // Create a new error object to return
  const enhancedError = new Error(fallbackMessage);
  
  try {
    // If this is already a response error we've processed
    if (error.isApiError) {
      return error;
    }

    // Check if we have a JSON response with our new error format
    if (error.responseData) {
      const data = error.responseData;
      
      // Our new backend error format with errorCode
      if (data.errorCode) {
        enhancedError.message = data.message || fallbackMessage;
        enhancedError.code = data.errorCode;
        enhancedError.data = data.data;
        enhancedError.timestamp = data.timestamp;
        enhancedError.status = error.status;
        
        // Add validation errors if available
        if (data.validationErrors) {
          enhancedError.validationErrors = data.validationErrors;
        }
      } 
      // Legacy error format
      else if (data.error) {
        enhancedError.message = data.error;
        enhancedError.code = 'UNKNOWN_ERROR';
      }
    }

    // Add response status if available
    if (error.status) {
      enhancedError.status = error.status;
      
      // Map HTTP status codes to general error types if no specific code exists
      if (!enhancedError.code) {
        switch (Math.floor(error.status / 100)) {
          case 4:
            if (error.status === 401) enhancedError.code = 'AUTH_ERROR';
            else if (error.status === 403) enhancedError.code = 'PERMISSION_ERROR';
            else if (error.status === 404) enhancedError.code = 'NOT_FOUND_ERROR';
            else if (error.status === 429) enhancedError.code = 'RATE_LIMIT_ERROR';
            else enhancedError.code = 'CLIENT_ERROR';
            break;
          case 5:
            enhancedError.code = 'SERVER_ERROR';
            break;
          default:
            enhancedError.code = 'UNKNOWN_ERROR';
        }
      }
    }
    
    // Mark as processed API error
    enhancedError.isApiError = true;
    
    // Include the original error for debugging
    enhancedError.originalError = error;
    
    return enhancedError;
  } catch (processingError) {
    // If something goes wrong while processing the error,
    // return a basic error with the original message
    console.error('Error while processing API error:', processingError);
    const fallbackError = new Error(error.message || fallbackMessage);
    fallbackError.code = 'ERROR_PROCESSING_FAILURE';
    fallbackError.isApiError = true;
    return fallbackError;
  }
};

/**
 * Custom fetch wrapper that prepends the API base URL and includes common headers.
 * Handles error processing with the new centralized error format.
 * @param {string} endpoint - The API endpoint (e.g., '/auth/login').
 * @param {object} options - Fetch options (method, headers, body, params, etc.).
 * @returns {Promise<object>} - The parsed JSON response.
 */
export const apiFetch = async (endpoint, options = {}) => {
  // Remove any trailing slash from API_BASE_URL and leading slash from endpoint
  const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, '');
  const normalizedEndpoint = endpoint.replace(/^\/+/, '');
  
  // Handle query parameters
  let url = `${normalizedBaseUrl}/${normalizedEndpoint}`;
  if (options.params) {
    const queryParams = new URLSearchParams(options.params).toString();
    url += `?${queryParams}`;
  }
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Include Authorization header if token exists
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, config);
    
    // Check if response has a Content-Type header
    const contentType = response.headers.get('Content-Type');
    
    // Parse response data based on content type
    let responseData;
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
      
      // Try to parse as JSON if it looks like it might be JSON
      try {
        if (responseData.trim().startsWith('{') || responseData.trim().startsWith('[')) {
          responseData = JSON.parse(responseData);
        }
      } catch (e) {
        // Keep as text if it can't be parsed as JSON
      }
    }
    
    if (!response.ok) {
      // Create an error object with additional properties
      const error = new Error(
        typeof responseData === 'object' && responseData.message 
          ? responseData.message 
          : 'API request failed'
      );
      
      // Add response data and status to the error
      error.responseData = responseData;
      error.status = response.status;
      error.statusText = response.statusText;
      
      // Process the error to standardize it
      throw processApiError(error);
    }
    
    return responseData;
  } catch (error) {
    // If it's not already a processed API error
    if (!error.isApiError) {
      // Check if it's a network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Network error: Unable to connect to the server');
        networkError.code = 'NETWORK_ERROR';
        networkError.originalError = error;
        networkError.isApiError = true;
        throw networkError;
      }
      
      // For any other type of error, process it
      const processedError = processApiError(
        error,
        `API Error (${endpoint}): ${error.message}`
      );
      
      // Log the error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('API Fetch Error:', {
          endpoint,
          error: processedError,
          originalError: error
        });
      } else {
        console.error(`API Fetch Error: ${processedError.message}`);
      }
      
      throw processedError;
    }
    
    // Re-throw already processed errors
    throw error;
  }
};

/**
 * Creates a query string from an object of parameters
 * @param {object} params - Key-value pairs for query parameters
 * @returns {string} - Formatted query string starting with '?' or empty string
 */
export const createQueryString = (params = {}) => {
  // Filter out undefined and null values
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined && value !== null)
  );
  
  const query = new URLSearchParams(filteredParams).toString();
  return query ? `?${query}` : '';
};

const api = {
  apiFetch,
  createQueryString
};

export default api;
