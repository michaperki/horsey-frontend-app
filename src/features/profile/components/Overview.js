
// src/features/profile/components/Overview.js

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { getUserBalances } from '../services/api';
import { useToken } from '../../token/contexts/TokenContext';
import { ApiError } from '../../common/components/ApiError';

const Overview = () => {
  const { token } = useAuth();
  const { tokenBalance, sweepstakesBalance, updateTokenBalance, updateSweepstakesBalance } = useToken();
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [errorBalance, setErrorBalance] = useState(null);

  const fetchBalances = useCallback(async () => {
    setLoadingBalance(true);
    setErrorBalance(null);
    try {
      if (!token) throw new Error('Please log in to view your balances.');
      const { tokenBalance, sweepstakesBalance } = await getUserBalances();
      updateTokenBalance(tokenBalance);
      updateSweepstakesBalance(sweepstakesBalance);
    } catch (error) {
      setErrorBalance({ code: 'BALANCE_ERROR', message: error.message || 'Failed to fetch balances.' });
    } finally {
      setLoadingBalance(false);
    }
  }, [token, updateTokenBalance, updateSweepstakesBalance]);

  useEffect(() => {
    if (token) {
      fetchBalances();
    } else {
      updateTokenBalance(0);
      updateSweepstakesBalance(0);
      setErrorBalance(null);
    }
  }, [token, fetchBalances, updateTokenBalance, updateSweepstakesBalance]);

  return (
    <div>
      <h2>Overview</h2>
      <section>
        <h3>Token Balance</h3>
        {loadingBalance ? (
          <p>Loading balance...</p>
        ) : errorBalance ? (
          <ApiError error={errorBalance} onDismiss={() => setErrorBalance(null)} compact />
        ) : (
          <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#2c3e50' }}>
            {tokenBalance} PTK
          </p>
        )}
      </section>

      <section>
        <h3>Sweepstakes Balance</h3>
        {loadingBalance ? (
          <p>Loading balance...</p>
        ) : errorBalance ? (
          <ApiError error={errorBalance} onDismiss={() => setErrorBalance(null)} compact />
        ) : (
          <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#2c3e50' }}>
            {sweepstakesBalance} SWP
          </p>
        )}
      </section>
    </div>
  );
};

export default Overview;

