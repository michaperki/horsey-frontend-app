
// src/components/Profile/Account.js

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserLichessInfo } from '../../services/api';
import LichessInfo from '../LichessInfo';
import DisconnectLichess from '../Auth/DisconnectLichess';
import './Account.css'; // Import the CSS file

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
    <div className="account-container">
      <h2>Account</h2>
      <section className="account-section">
        <h3>
          Lichess Account
        </h3>
        {loadingLichess ? (
          <p className="account-loading">Loading Lichess information...</p>
        ) : errorLichess && !lichessInfo ? (
          <p className="account-error">{errorLichess}</p>
        ) : lichessInfo ? (
          <div className="lichess-container">
            <LichessInfo info={lichessInfo} />
            <DisconnectLichess onDisconnect={handleLichessChange} />
          </div>
        ) : (
          <p className="account-message">Your Lichess account is not connected.</p>
          // Optionally, add a <LichessConnect /> component if available
        )}
      </section>
    </div>
  );
};

export default Account;
