
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

/**
 * Places a new bet.
 * @param {string} token - JWT token for authentication.
 * @param {object} betData - Data for the new bet (excluding gameId).
 * @returns {Promise<object>} - The newly created bet.
 */
export const placeBet = async (token, betData) => {
  try {
    const { creatorColor, amount } = betData; // Destructure required fields
    const response = await fetch('/bets/place', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ creatorColor, amount }), // Exclude gameId
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to place the bet');
    }

    const data = await response.json();
    return data.bet;
  } catch (error) {
    console.error('Error placing bet:', error);
    throw error;
  }
};

/**
 * Accepts a bet.
 * @param {string} token - JWT token for authentication.
 * @param {string} betId - ID of the bet to accept.
 * @param {string} opponentColor - Color preference of the acceptor.
 * @returns {Promise<object>} - The updated bet along with gameLink.
 */
export const acceptBet = async (token, betId, opponentColor) => {
  try {
    const response = await fetch(`/bets/accept/${betId}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ opponentColor }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to accept the bet');
    }

    const data = await response.json();
    return data; // Return the entire response to include gameLink
  } catch (error) {
    console.error('Error accepting bet:', error);
    throw error;
  }
};


/**
 * Initiates the Lichess OAuth flow by redirecting the user to the backend endpoint,
 * including the user's JWT token as a query parameter.
 * @param {string} token - JWT token for authentication.
 */
export const initiateLichessOAuth = (token) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const encodedToken = encodeURIComponent(token);
  window.location.href = `${backendUrl}/lichess/auth?token=${encodedToken}`;
};

/**
 * Fetches the authenticated user's profile.
 * @param {string} token - JWT token for authentication.
 * @returns {Promise<object>} - The user's profile data.
 */
export const getUserProfile = async (token) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/profile`, { // Ensure REACT_APP_BACKEND_URL is set
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch user profile');
    }

    const data = await response.json();
    return data.user; // Adjust based on your backend's response structure
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Disconnects the user's Lichess account.
 * @param {string} token - JWT token for authentication.
 * @returns {Promise<void>}
 */
export const disconnectLichess = async (token) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/lichess/auth/disconnect`, { // Update the URL if different
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to disconnect Lichess account');
    }

    // Optionally, handle successful disconnection
  } catch (error) {
    console.error('Error disconnecting Lichess account:', error);
    throw error;
  }
};
