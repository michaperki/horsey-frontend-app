// src/features/profile/components/History.js

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from 'features/auth/contexts/AuthContext';
import { getUserBets } from 'features/betting/services/api';
import YourBets from 'features/betting/components/YourBets';
import { ApiError } from '../../common/components/ApiError';
import './History.css';

const History = () => {
  const { token } = useAuth();
  const [bets, setBets] = useState([]);
  const [loadingBets, setLoadingBets] = useState(false);
  const [errorBets, setErrorBets] = useState(null);

  const fetchBets = useCallback(async () => {
    setLoadingBets(true);
    setErrorBets(null);
    try {
      if (!token) throw new Error('Please log in to view your bets.');
      const response = await getUserBets(token, { page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' });
      setBets(response.bets);
    } catch (error) {
      setErrorBets({ code: 'BETS_ERROR', message: error.message || 'Failed to fetch bets.' });
    } finally {
      setLoadingBets(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchBets();
    } else {
      setBets([]);
      setErrorBets(null);
    }
  }, [token, fetchBets]);

  return (
    <div className="p-md font-sans">
      <section className="mb-md">
        {loadingBets ? (
          <p className="text-primary">Loading your bets...</p>
        ) : errorBets ? (
          <ApiError error={errorBets} onDismiss={() => setErrorBets(null)} onRetry={fetchBets} />
        ) : bets.length > 0 ? (
          <YourBets />
        ) : (
          <p className="text-gray-300">You have not placed any bets yet.</p>
        )}
      </section>
    </div>
  );
};

export default History;

