import { apiFetch } from '../../common/services/api';

/**
 * Fetches the authenticated user's token and sweepstakes balances.
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

export const tokenApi = {
  getUserBalances,
};

export default tokenApi;
