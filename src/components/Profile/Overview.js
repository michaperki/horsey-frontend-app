
// src/components/Profile/Overview.js

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserBalance } from '../../services/api';

const Overview = () => {
  const { token } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [errorBalance, setErrorBalance] = useState('');

  const fetchBalance = async () => {
    setLoadingBalance(true);
    setErrorBalance('');
    try {
      if (!token) {
        throw new Error('Please log in to view your balance.');
      }

      const userBalance = await getUserBalance(token);
      setBalance(userBalance);
    } catch (error) {
      setErrorBalance(error.message || 'Failed to fetch balance.');
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBalance();
    } else {
      setBalance(null);
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
        ) : balance !== null ? (
          <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#2c3e50' }}>{balance} PTK</p>
        ) : (
          <p>No balance available.</p>
        )}
      </section>
    </div>
  );
};

export default Overview;

