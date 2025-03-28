// src/features/betting/services/api.js - Updated for new error handling

import { apiFetch } from '../../common/services/api';

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

  // Validate input - this could become client-side validation to prevent server calls
  const validColorPreferences = ['white', 'black', 'random'];
  const validVariants = ['standard', 'crazyhouse', 'chess960'];
  const validCurrencyTypes = ['token', 'sweepstakes'];

  if (!validColorPreferences.includes(colorPreference)) {
    const error = new Error('Invalid color preference.');
    error.code = 'VALIDATION_ERROR';
    error.isApiError = true;
    throw error;
  }

  if (!validVariants.includes(variant)) {
    const error = new Error('Invalid game variant.');
    error.code = 'VALIDATION_ERROR';
    error.isApiError = true;
    throw error;
  }

  if (!validCurrencyTypes.includes(currencyType)) {
    const error = new Error('Invalid currency type.');
    error.code = 'VALIDATION_ERROR';
    error.isApiError = true;
    throw error;
  }

  if (typeof amount !== 'number' || amount <= 0) {
    const error = new Error('Bet amount must be a positive number.');
    error.code = 'VALIDATION_ERROR';
    error.isApiError = true;
    throw error;
  }

  if (
    !timeControl ||
    typeof timeControl !== 'string' ||
    !/^\d+\|\d+$/.test(timeControl)
  ) {
    const error = new Error('Time Control must be a string in the format "minutes|increment".');
    error.code = 'VALIDATION_ERROR'; 
    error.isApiError = true;
    throw error;
  }

  // Let apiFetch handle the error processing
  const data = await apiFetch('/bets/place', {
    method: 'POST',
    body: JSON.stringify({
      colorPreference: colorPreference.toLowerCase(),
      amount,
      timeControl,
      variant,
      currencyType,
    }),
  });
  
  return data.bet;
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
    body: JSON.stringify({ currencyType }),
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
 * @param {string} currencyType - Type of currency to filter bets by
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
 * Fetches the authenticated user's bet history.
 * @param {object} params - Query parameters for pagination and sorting.
 * @returns {Promise<object>} - An object containing bets data.
 */
export const getUserBets = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const data = await apiFetch(`/bets/history?${query}`, {
    method: 'GET',
  });
  return data;
};

export const bettingApi = {
  placeBet,
  acceptBet,
  cancelBet,
  getAvailableBets, 
  getUserBets
};

export default bettingApi;
