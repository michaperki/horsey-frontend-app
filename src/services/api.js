
// src/services/api.js

import { apiFetch } from 'features/common/services/api';

/**
 * Registers a new user.
 * @param {object} userData - The registration data (username, email, password).
 * @returns {Promise<object>} - The response data from the API.
 */
export const register = async (userData) => {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return data;
};

/**
 * Fetches the authenticated user's balances.
 * @returns {Promise<object>} - An object containing tokenBalance and sweepstakesBalance.
 */
export const getUserBalances = async () => {
  const data = await apiFetch('/user/balances', {
    method: 'GET',
  });
  return {
    tokenBalance: data.tokenBalance,
    sweepstakesBalance: data.sweepstakesBalance,
  };
};

/**
 * Fetches the authenticated user's bet history.
 * @param {object} params - Query parameters for pagination and sorting.
 * @returns {Promise<object>} - An object containing bets data.
 */
export const getUserBets = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const data = await apiFetch(`/bets/history?${query}`, {
    method: 'GET',
  });
  console.log("Received user bets:", data);
  return data;
};

/**
 * Places a new bet.
 * @param {object} betData - Data for the new bet.
 * @param {string} betData.colorPreference - Color preference (e.g., 'random', 'white', 'black').
 * @param {number} betData.amount - Amount to bet.
 * @param {string} betData.timeControl - Time control in the format "minutes|increment".
 * @param {string} betData.variant - Game variant (e.g., 'standard').
 * @param {string} betData.currencyType - Currency type ('token' or 'sweepstakes').
 * @returns {Promise<object>} - The newly created bet.
 */
export const placeBet = async (betData) => {
  const { colorPreference, amount, timeControl, variant, currencyType } = betData;

  // Validate input
  const validColorPreferences = ['white', 'black', 'random'];
  const validVariants = ['standard', 'crazyhouse', 'chess960'];
  const validCurrencyTypes = ['token', 'sweepstakes'];

  if (!validColorPreferences.includes(colorPreference)) {
    throw new Error('Invalid color preference.');
  }

  if (!validVariants.includes(variant)) {
    throw new Error('Invalid game variant.');
  }

  if (!validCurrencyTypes.includes(currencyType)) {
    throw new Error('Invalid currency type.');
  }

  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Bet amount must be a positive number.');
  }

  if (
    !timeControl ||
    typeof timeControl !== 'string' ||
    !/^\d+\|\d+$/.test(timeControl)
  ) {
    throw new Error('Time Control must be a string in the format "minutes|increment".');
  }

  try {
    const data = await apiFetch('/bets/place', {
      method: 'POST',
      body: JSON.stringify({
        colorPreference: colorPreference.toLowerCase(),
        amount,
        timeControl,
        variant,
        currencyType, // Include currencyType in the request body
      }),
    });
    return data.bet;
  } catch (error) {
    console.error('Error placing bet:', error);
    throw error;
  }
};

/**
 * Accepts a bet.
 * @param {string} betId - ID of the bet to accept.
 * @param {string} currencyType - Currency type ('token' or 'sweepstakes').
 * @returns {Promise<object>} - The updated bet along with gameLink.
 */
export const acceptBet = async (betId, currencyType) => {
  const data = await apiFetch(`/bets/accept/${betId}`, {
    method: 'POST',
    body: JSON.stringify({ currencyType }), // Pass currencyType if needed
  });
  return data; // Includes gameLink
};

/**
 * Fetches the authenticated user's profile.
 * @returns {Promise<object>} - The user's profile data.
 */
export const getUserProfile = async (currencyType = 'token') => {
  const data = await apiFetch(`/auth/profile?currencyType=${currencyType}`, {
    method: 'GET',
    credentials: 'include',
  });
  return data;
};

/**
 * Disconnects the user's Lichess account.
 */
export const disconnectLichessAccount = async () => {
  const data = await apiFetch('/lichess/disconnect', {
    method: 'POST',
  });
  return data;
};

/**
 * Fetches the authenticated user's Lichess information.
 */
export const getUserLichessInfo = async () => {
  const data = await apiFetch('/lichess/user', {
    method: 'GET',
  });
  return data;
};

/**
 * Cancels a bet.
 * @param {string} betId - ID of the bet to cancel.
 * @returns {Promise<object>} - The response from the API.
 */
export const cancelBet = async (betId) => {
  const data = await apiFetch(`/bets/cancel/${betId}`, {
    method: 'POST',
  });
  return data;
};

/**
 * Fetches available bets for seekers.
 * @returns {Promise<Array>} - An array of available bets.
 */
export const getAvailableBets = async (currencyType) => {
  const query = currencyType ? `?currencyType=${currencyType}` : '';
  const data = await apiFetch(`/bets/seekers${query}`, {
    method: 'GET',
  });
  return data.seekers || [];
};

/**
 * Logs in a user with provided email and password.
 * @param {object} credentials - User's login credentials.
 * @param {string} credentials.email - User's email.
 * @param {string} credentials.password - User's password.
 * @returns {Promise<string>} - The JWT token upon successful login.
 */
export const loginUser = async (credentials) => {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return data.token;
};

/**
 * Fetches admin-specific data.
 * @returns {Promise<object>} - Admin dashboard data.
 */
export const getAdminDashboardData = async () => {
  const data = await apiFetch('/admin/dashboard', {
    method: 'GET',
  });
  return data;
};

/**
 * Fetches the authenticated user's Lichess connection status.
 * @returns {Promise<boolean>} - True if connected, else false.
 */
export const getLichessStatus = async () => {
  const data = await apiFetch('/lichess/status', {
    method: 'GET',
  });
  return data.connected;
};

/**
 * Fetches the authenticated user's data, including notifications.
 * @returns {Promise<object>} - User data containing notifications and other info.
 */
export const getUserData = async () => {
  const data = await apiFetch('/user/data', {
    method: 'GET',
  });
  return data;
};

/**
 * Initiates the Lichess OAuth flow by using the apiFetch utility to fetch the OAuth URL
 * and redirect the user to the returned URL.
 */
export const initiateLichessOAuth = async () => {
  try {
    const data = await apiFetch('/lichess/auth', {
      method: 'GET',
    });

    if (data && data.redirectUrl) {
      window.location.href = data.redirectUrl;
    } else {
      console.error('Redirect URL not received from the server.');
    }
  } catch (error) {
    console.error('Error initiating Lichess OAuth:', error.message);
  }
};

/**
 * Initiates a purchase with the specified payment method and amount.
 * @param {string} paymentMethod - Payment method (e.g., 'stripe', 'crypto').
 * @param {number} amount - Amount to purchase.
 * @returns {Promise<object>} - The response data with updated balances.
 */
export const purchaseTokens = async (paymentMethod, amount) => {
  const data = await apiFetch('/payments/purchase', {
    method: 'POST',
    body: JSON.stringify({
      paymentMethod,
      amount
    }),
  });
  return data; // Returns updated user balances or error message
};

/**
 * Fetches the list of available products from the store.
 * @returns {Promise<Array>} - An array of products available for purchase.
 */
export const fetchProducts = async () => {
  const data = await apiFetch('/store/products', {
    method: 'GET',
  });
  return data.products; // Assuming the backend response contains a 'products' array
};

/**
 * Creates a new notification for the authenticated user.
 * @param {object} notificationData - Data for the new notification.
 * @param {string} notificationData.message - The notification message.
 * @param {string} [notificationData.type] - The type of notification.
 * @returns {Promise<object>} - The response data from the API.
 */
export const createNotification = async (notificationData) => {
  const data = await apiFetch('/notifications', {
    method: 'POST',
    body: JSON.stringify(notificationData),
  });
  return data;
};

/**
 * Fetch initial notifications.
 * @param {boolean} [read=false] - Filter by read/unread notifications.
 * @returns {Promise<object>} - Notifications data.
 */
export const fetchNotifications = async (read = false) => {
  return apiFetch('/notifications', {
    method: 'GET',
    params: { read },
  });
};

/**
 * Mark a specific notification as read.
 * @param {string} notificationId - ID of the notification to mark as read.
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (notificationId) => {
  return apiFetch(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
};

/**
 * Mark all notifications as read.
 * @returns {Promise<void>}
 */
export const markAllNotificationsAsRead = async () => {
  return apiFetch('/notifications/read-all', {
    method: 'POST',
  });
};


/**
 * Handles Lichess OAuth callback.
 * @param {object} payload - Payload containing authorization code and state.
 * @param {string} payload.code - Authorization code.
 * @param {string} payload.state - OAuth state parameter.
 * @returns {Promise<object>} - Response from the server.
 */
export const lichessCallback = async (payload) => {
  const data = await apiFetch('/auth/lichess/callback', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
};
