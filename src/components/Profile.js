// src/components/Profile.js

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserBalance, getUserBets, getUserLichessInfo } from '../services/api';
import YourBets from './YourBets';
import LichessInfo from './LichessInfo';
import DisconnectLichess from './Auth/DisconnectLichess';
import LichessConnect from './Auth/LichessConnect'; // Existing component

const Profile = () => {
  const { token } = useAuth(); // Access the auth token from context
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [errorBalance, setErrorBalance] = useState('');

  const [lichessInfo, setLichessInfo] = useState(null);
  const [loadingLichess, setLoadingLichess] = useState(false);
  const [errorLichess, setErrorLichess] = useState('');

  const [bets, setBets] = useState([]);
  const [loadingBets, setLoadingBets] = useState(false);
  const [errorBets, setErrorBets] = useState('');

  /**
   * Fetches the user's token balance.
   */
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

  /**
   * Fetches the user's Lichess information.
   */
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

  /**
   * Fetches the user's bets.
   */
  const fetchBets = async () => {
    setLoadingBets(true);
    setErrorBets('');
    try {
      if (!token) {
        throw new Error('Please log in to view your bets.');
      }

      const userBets = await getUserBets(token);
      setBets(userBets);
    } catch (error) {
      setErrorBets(error.message || 'Failed to fetch bets.');
    } finally {
      setLoadingBets(false);
    }
  };

  /**
   * Effect hook to fetch data when the token changes.
   * Resets state if the user logs out.
   */
  useEffect(() => {
    if (token) {
      fetchBalance();
      fetchLichessInfo();
      fetchBets();
      
      // Check for query parameters indicating OAuth status
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('lichess') === 'connected') {
        fetchLichessInfo(); // Re-fetch to get updated Lichess info
      }
    } else {
      // Reset all states when there's no token (user logged out)
      setBalance(null);
      setErrorBalance('');
      setLichessInfo(null);
      setErrorLichess('');
      setBets([]);
      setErrorBets('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, window.location.search]); // Add window.location.search to dependencies

  /**
   * Handler to refresh Lichess information after connecting or disconnecting.
   */
  const handleLichessChange = () => {
    fetchLichessInfo();
  };

  return (
    <div style={styles.container}>
      <h2>Your Profile</h2>

      {/* User Balance Section */}
      <section style={styles.section}>
        <h3>Token Balance</h3>
        {loadingBalance ? (
          <p>Loading balance...</p>
        ) : errorBalance ? (
          <p style={styles.error}>{errorBalance}</p>
        ) : balance !== null ? (
          <p style={styles.balance}>{balance} PTK</p>
        ) : (
          <p>No balance available.</p>
        )}
      </section>

      {/* Lichess Information Section */}
      <section style={styles.section}>
        <h3>Lichess Account</h3>
        {loadingLichess ? (
          <p>Loading Lichess information...</p>
        ) : errorLichess && !lichessInfo ? (
          <p style={styles.error}>{errorLichess}</p>
        ) : lichessInfo ? (
          <>
            <LichessInfo info={lichessInfo} />
            <DisconnectLichess onDisconnect={handleLichessChange} />
          </>
        ) : (
          <>
            <p>Your Lichess account is not connected.</p>
            <LichessConnect /> {/* Existing Connect Component */}
          </>
        )}
      </section>

      {/* User Bets Section */}
      <section style={styles.section}>
        <h3>Your Bets</h3>
        {loadingBets ? (
          <p>Loading your bets...</p>
        ) : errorBets ? (
          <p style={styles.error}>{errorBets}</p>
        ) : bets ? (
          <YourBets bets={bets} />
        ) : (
          <p>You have no active bets.</p>
        )}
      </section>
    </div>
  );
};

// Inline Styles
const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: 'auto',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    marginTop: '50px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  section: {
    marginBottom: '30px',
    textAlign: 'center',
  },
  balance: {
    fontSize: '1.5em',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  error: {
    color: 'red',
  },
};

export default Profile;
