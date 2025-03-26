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

export const storeApi = {
  fetchProducts,
  purchaseTokens,
};

export default storeApi;
