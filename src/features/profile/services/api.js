// src/features/profile/services/api.js - Updated for new error handling

import { apiFetch } from '../../common/services/api';

/**
 * Fetches the authenticated user's profile.
 * @param {string} currencyType - Currency type (defaults to 'token').
 * @returns {Promise<object>} - The user's profile data.
 */
export const getUserProfile = async (currencyType = 'token') => {
  const data = await apiFetch(`/auth/profile?currencyType=${currencyType}`, {
    method: 'GET',
  });
  return data;
};

/**
 * Updates the authenticated user's profile.
 * @param {object} profileData - Updated profile data.
 * @returns {Promise<object>} - The updated profile information.
 */
export const updateUserProfile = async (profileData) => {
  const data = await apiFetch('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(profileData),
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

export const profileApi = {
  getUserProfile,
  updateUserProfile,
  getUserBalances,
};

export default profileApi;
