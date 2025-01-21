
// src/utils/api.js

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * Custom fetch wrapper that prepends the API base URL and includes common headers.
 * @param {string} endpoint - The API endpoint (e.g., '/auth/login').
 * @param {object} options - Fetch options (method, headers, body, etc.).
 * @returns {Promise<object>} - The parsed JSON response.
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

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

