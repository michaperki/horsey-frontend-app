
// src/components/Profile/Overview.js

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserBalances } from '../../services/api'; // Updated import
import { useToken } from '../../contexts/TokenContext'; // Import TokenContext

const Overview = () => {
  const { token } = useAuth();
  const {
    tokenBalance,
    sweepstakesBalance,
    updateTokenBalance,
    updateSweepstakesBalance,
  } = useToken(); // Destructure balances and update functions from TokenContext

  const [loadingBalance, setLoadingBalance] = useState(false);
  const [errorBalance, setErrorBalance] = useState('');

  const fetchBalances = async () => {
    setLoadingBalance(true);
    setErrorBalance('');
    try {
      if (!token) {
        throw new Error('Please log in to view your balances.');
      }

      const { tokenBalance, sweepstakesBalance } = await getUserBalances(); // Fetch both balances

      // Update balances in TokenContext
      updateTokenBalance(tokenBalance);
      updateSweepstakesBalance(sweepstakesBalance);
    } catch (error) {
      setErrorBalance(error.message || 'Failed to fetch balances.');
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBalances();
    } else {
      // If no token, reset balances
      updateTokenBalance(0);
      updateSweepstakesBalance(0);
      setErrorBalance('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div>
      <h2>Overview</h2>
      <section>
        <h3>Token Balance</h3>
        {loadingBalance ? (
          <p>Loading balance...</p>
        ) : errorBalance ? (
          <p style={{ color: 'red' }}>{errorBalance}</p>
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
          <p style={{ color: 'red' }}>{errorBalance}</p>
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

