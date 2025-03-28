// src/features/store/services/api.js - Updated for new error handling

import { apiFetch } from '../../common/services/api';

/**
 * Fetches the list of available products from the store.
 * @returns {Promise<Array>} - An array of products available for purchase.
 */
export const fetchProducts = async () => {
  const data = await apiFetch('/store/products', {
    method: 'GET',
  });
  return data.products;
};

/**
 * Initiates a purchase using the specified payment method and amount.
 * @param {string} paymentMethod - Payment method (e.g., 'stripe', 'crypto').
 * @param {number} amount - Amount to purchase.
 * @returns {Promise<object>} - The response data with updated balances or purchase details.
 */
export const purchaseTokens = async (paymentMethod, amount) => {
  const data = await apiFetch('/payments/purchase', {
    method: 'POST',
    body: JSON.stringify({ paymentMethod, amount }),
  });
  return data;
};

/**
 * Fetches the user's purchase history.
 * @param {object} params - Query parameters for filtering and pagination.
 * @returns {Promise<object>} - The purchase history data.
 */
export const getPurchaseHistory = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const data = await apiFetch(`/store/history?${queryString}`, {
    method: 'GET',
  });
  return data;
};

export const storeApi = {
  fetchProducts,
  purchaseTokens,
  getPurchaseHistory,
};

export default storeApi;
