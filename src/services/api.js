
// src/services/api.js

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
