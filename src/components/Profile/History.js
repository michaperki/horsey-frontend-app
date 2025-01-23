
// src/components/Profile/History.js

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserBets } from '../../services/api';
import YourBets from '../YourBets';

const History = () => {
  const { token } = useAuth();
  const [bets, setBets] = useState([]);
  const [loadingBets, setLoadingBets] = useState(false);
  const [errorBets, setErrorBets] = useState('');

  const fetchBets = async () => {
    setLoadingBets(true);
    setErrorBets('');
    try {
      if (!token) {
        throw new Error('Please log in to view your bets.');
      }

      const response = await getUserBets(token, { page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' });
      setBets(response.bets);
    } catch (error) {
      setErrorBets(error.message || 'Failed to fetch bets.');
    } finally {
      setLoadingBets(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBets();
    } else {
      setBets([]);
      setErrorBets('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div>
      <h2>History</h2>
      <section>
        <h3>Your Bets</h3>
        {loadingBets ? (
          <p>Loading your bets...</p>
        ) : errorBets ? (
          <p style={{ color: 'red' }}>{errorBets}</p>
        ) : bets.length > 0 ? (
          <YourBets bets={bets} />
        ) : (
          <p>You have no active bets.</p>
        )}
      </section>
    </div>
  );
};

export default History;
