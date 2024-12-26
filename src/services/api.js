
// src/services/api.js

/**
 * Fetches the authenticated user's token balance.
 * @param {string} token - JWT token for authentication.
 * @returns {Promise<number>} - The user's token balance.
 */
export const getUserBalance = async (token) => {
  try {
    const response = await fetch('/tokens/balance/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user balance');
    }

    const data = await response.json();
    return data.balance;
  } catch (error) {
    console.error('Error fetching user balance:', error);
    throw error;
  }
};

/**
 * Fetches the authenticated user's bet history.
 * @param {string} token - JWT token for authentication.
 * @param {object} params - Query parameters for pagination and sorting.
 * @returns {Promise<object>} - An object containing bets data.
 */
export const getUserBets = async (token, params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`/bets/history?${query}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch your bet history');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching bet history:', error);
    throw error;
  }
};
