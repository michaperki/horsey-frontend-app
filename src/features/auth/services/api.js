// src/features/auth/services/api.js - Updated for new error handling

import { apiFetch } from '../../common/services/api'; 

// User Authentication
export const login = async (credentials) => {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return data.token;
};

export const register = async (userData) => {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return data;
};

export const getUserProfile = async (currencyType = 'token') => {
  const data = await apiFetch(`/auth/profile?currencyType=${currencyType}`, {
    method: 'GET',
  });
  return data;
};

// Lichess Integration
export const initiateLichessOAuth = async () => {
  const data = await apiFetch('/lichess/auth', {
    method: 'GET',
  });

  if (data && data.redirectUrl) {
    window.location.href = data.redirectUrl;
  } else {
    throw new Error('Redirect URL not received from the server.');
  }
};

export const lichessCallback = async (payload) => {
  const data = await apiFetch('/auth/lichess/callback', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
};

export const connectLichess = async () => {
  const data = await apiFetch('/lichess/connect', {
    method: 'GET',
  });
  return data;
};

export const disconnectLichessAccount = async () => {
  const data = await apiFetch('/lichess/disconnect', {
    method: 'POST',
  });
  return data;
};

export const getLichessStatus = async () => {
  const data = await apiFetch('/lichess/status', {
    method: 'GET',
  });
  return data.connected;
};

export const getUserLichessInfo = async () => {
  const data = await apiFetch('/lichess/user', {
    method: 'GET',
  });
  return data;
};

// Create a consolidated API object for components that prefer object notation
export const api = {
  login,
  register,
  getUserProfile,
  initiateLichessOAuth,
  lichessCallback,
  connectLichess,
  disconnectLichessAccount,
  getLichessStatus,
  getUserLichessInfo,
};

export default api;
