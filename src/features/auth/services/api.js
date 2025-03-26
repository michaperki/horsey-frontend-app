import axios from 'axios';
import { apiFetch } from '../../common/services/api'; 

// User Authentication
export const login = async (credentials) => {
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return data.token;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to login' };
  }
};

export const register = async (userData) => {
  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to register' };
  }
};

export const getUserProfile = async (currencyType = 'token') => {
  try {
    const data = await apiFetch(`/auth/profile?currencyType=${currencyType}`, {
      method: 'GET',
      credentials: 'include',
    });
    return data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch profile' };
  }
};

// Lichess Integration
export const initiateLichessOAuth = async () => {
  try {
    const data = await apiFetch('/lichess/auth', {
      method: 'GET',
    });

    if (data && data.redirectUrl) {
      window.location.href = data.redirectUrl;
    } else {
      throw new Error('Redirect URL not received from the server.');
    }
  } catch (error) {
    throw error.response?.data || { error: 'Failed to initiate Lichess OAuth' };
  }
};

export const lichessCallback = async (payload) => {
  try {
    const data = await apiFetch('/auth/lichess/callback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to process Lichess callback' };
  }
};

export const connectLichess = async (token) => {
  try {
    const data = await apiFetch('/lichess/connect', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to connect Lichess' };
  }
};

export const disconnectLichessAccount = async () => {
  try {
    const data = await apiFetch('/lichess/disconnect', {
      method: 'POST',
    });
    return data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to disconnect Lichess account' };
  }
};

export const getLichessStatus = async () => {
  try {
    const data = await apiFetch('/lichess/status', {
      method: 'GET',
    });
    return data.connected;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to get Lichess status' };
  }
};

export const getUserLichessInfo = async () => {
  try {
    const data = await apiFetch('/lichess/user', {
      method: 'GET',
    });
    return data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to get Lichess user info' };
  }
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