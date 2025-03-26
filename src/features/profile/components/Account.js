// src/components/Profile/Account.js

import React, { useEffect, useState } from 'react';
import { useAuth } from 'features/auth/contexts/AuthContext';
import { getUserLichessInfo } from 'features/auth/services/api';
import LichessInfo from './LichessInfo';
import DisconnectLichess from 'features/auth/components/DisconnectLichess';
import './Account.css'; // Revised CSS file

const Account = () => {
  const { token } = useAuth();
  const [lichessInfo, setLichessInfo] = useState(null);
  const [loadingLichess, setLoadingLichess] = useState(false);
  const [errorLichess, setErrorLichess] = useState('');

  const fetchLichessInfo = async () => {
    setLoadingLichess(true);
    setErrorLichess('');
    try {
      if (!token) {
        throw new Error('Please log in to view your Lichess information.');
      }

      const data = await getUserLichessInfo(token);
      console.log('Received Lichess Info:', data);
      setLichessInfo(data);
    } catch (error) {
      if (error.status === 404) {
        // User has not connected a Lichess account
        setLichessInfo(null);
      } else {
        setErrorLichess(error.message || 'Failed to fetch Lichess information.');
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
      setErrorLichess('');
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
          <p className="text-danger text-sm my-1">{errorLichess}</p>
        ) : lichessInfo ? (
          <div className="flex flex-col gap-2">
            <LichessInfo info={lichessInfo} />
            <DisconnectLichess onDisconnect={handleLichessChange} />
          </div>
        ) : (
          <p className="text-gray-300 text-sm my-1">Your Lichess account is not connected.</p>
          // Optionally, add a <LichessConnect /> component if available
        )}
      </section>
    </div>
  );
};

export default Account;
