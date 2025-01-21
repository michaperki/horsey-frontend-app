// src/services/api.js

import { apiFetch } from '../utils/api';

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
 * Fetches the authenticated user's token balance.
 * @returns {Promise<number>} - The user's token balance.
 */
export const getUserBalance = async () => {
  const data = await apiFetch('/tokens/balance/user', {
    method: 'GET',
  });
  return data.balance;
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
  console.log("received user bets:", data);
  return data;
};

/**
 * Places a new bet.
 * @param {object} betData - Data for the new bet.
 * @returns {Promise<object>} - The newly created bet.
 */
export const placeBet = async (betData) => {
  const { colorPreference, amount, timeControl, variant } = betData;
  const data = await apiFetch('/bets/place', {
    method: 'POST',
    body: JSON.stringify({
      colorPreference: colorPreference.toLowerCase(),
      amount,
      timeControl,
      variant,
    }),
  });
  return data.bet;
};

/**
 * Accepts a bet.
 * @param {string} betId - ID of the bet to accept.
 * @param {string} opponentColor - Color preference of the acceptor.
 * @returns {Promise<object>} - The updated bet along with gameLink.
 */
export const acceptBet = async (betId, opponentColor) => {
  const data = await apiFetch(`/bets/accept/${betId}`, {
    method: 'POST',
    body: JSON.stringify({ opponentColor }),
  });
  return data; // Includes gameLink
};

/**
 * Initiates the Lichess OAuth flow by redirecting the user to the backend endpoint.
 */
export const initiateLichessOAuth = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem('token');
  const encodedToken = encodeURIComponent(token);
  window.location.href = `${backendUrl}/lichess/auth?token=${encodedToken}`;
};

/**
 * Fetches the authenticated user's profile.
 * @returns {Promise<object>} - The user's profile data.
 */
export const getUserProfile = async () => {
  const data = await apiFetch('/auth/profile', {
    method: 'GET',
    credentials: 'include',
  });
  return data.user;
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
export const getAvailableBets = async () => {
  const data = await apiFetch('/bets/seekers', {
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

// Add more API functions as needed following the above pattern
