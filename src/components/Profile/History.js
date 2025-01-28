// src/components/Profile/History.js

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserBets } from '../../services/api';
import YourBets from '../YourBets';
import './History.css'; // Import the CSS file (now empty)

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
    <div className="p-md font-sans">
      <section className="mb-md">
        {loadingBets ? (
          <p className="text-primary">Loading your bets...</p>
        ) : errorBets ? (
          <p className="text-danger mb-2">{errorBets}</p>
        ) : bets.length > 0 ? (
          <YourBets />
        ) : (
          <p className="text-gray-300">You have no active bets.</p>
        )}
      </section>
    </div>
  );
};

export default History;
