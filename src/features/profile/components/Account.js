
// src/features/profile/components/Account.js

import React, { useEffect, useState } from 'react';
import { useAuth } from 'features/auth/contexts/AuthContext';
import { getUserLichessInfo } from 'features/auth/services/api';
import LichessInfo from './LichessInfo';
import DisconnectLichess from 'features/auth/components/DisconnectLichess';
import { ApiError } from '../../common/components/ApiError';
import './Account.css';

const Account = () => {
  const { token } = useAuth();
  const [lichessInfo, setLichessInfo] = useState(null);
  const [loadingLichess, setLoadingLichess] = useState(false);
  const [errorLichess, setErrorLichess] = useState(null);

  const fetchLichessInfo = async () => {
    setLoadingLichess(true);
    setErrorLichess(null);
    try {
      if (!token) {
        throw new Error('Please log in to view your Lichess information.');
      }
      const data = await getUserLichessInfo(token);
      console.log('Received Lichess Info:', data);
      setLichessInfo(data);
    } catch (error) {
      // If error status is 404, user may simply not have connected a Lichess account
      if (error.status === 404) {
        setLichessInfo(null);
      } else {
        setErrorLichess({ code: 'LICHESS_ERROR', message: error.message || 'Failed to fetch Lichess information.' });
      }
    } finally {
      setLoadingLichess(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLichessInfo();
    } else {
      setLichessInfo(null);
      setErrorLichess(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, window.location.search]);

  const handleLichessChange = () => {
    fetchLichessInfo();
  };

  return (
    <div className="p-md bg-light rounded-md max-w-600px mx-auto">
      <h2 className="text-2xl mb-md text-center">Account</h2>
      <section className="mb-5">
        <h3 className="text-xl mb-2 flex items-center justify-between">
          Lichess Account
        </h3>
        {loadingLichess ? (
          <p className="text-primary text-sm my-1">Loading Lichess information...</p>
        ) : errorLichess && !lichessInfo ? (
          <ApiError 
            error={errorLichess} 
            onDismiss={() => setErrorLichess(null)}
            compact 
          />
        ) : lichessInfo ? (
          <div className="flex flex-col gap-2">
            <LichessInfo info={lichessInfo} />
            <DisconnectLichess onDisconnect={handleLichessChange} />
          </div>
        ) : (
          <p className="text-gray-300 text-sm my-1">
            Your Lichess account is not connected.
          </p>
        )}
      </section>
    </div>
  );
};

export default Account;

