
// src/utils/api.js

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * Custom fetch wrapper that prepends the API base URL and includes common headers.
 * Handles query parameters by appending them to the URL.
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

    // Attempt to parse the response as JSON
    const data = await response.json();

    if (!response.ok) {
      // If the response is not OK, throw an error with the message from the response
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Fetch Error: ${error.message}`);
    throw error;
  }
};

