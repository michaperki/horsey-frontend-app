
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserBalance, getUserBets } from '../services/api';
import YourBets from './YourBets';
import LichessInfo from './LichessInfo';
import DisconnectLichess from './Auth/DisconnectLichess';

const Profile = () => {
  const { token } = useAuth(); // Use AuthContext
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [errorBalance, setErrorBalance] = useState('');
  const [lichessInfo, setLichessInfo] = useState(null);
  const [loadingLichess, setLoadingLichess] = useState(false);
  const [errorLichess, setErrorLichess] = useState('');

  // Fetch User Balance
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

  // Fetch Lichess Information
  const fetchLichessInfo = async () => {
    setLoadingLichess(true);
    setErrorLichess('');
    try {
      if (!token) {
        throw new Error('Please log in to view your Lichess information.');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/lichess/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Lichess account not connected.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Lichess information.');
      }

      const data = await response.json();
      setLichessInfo(data);
    } catch (error) {
      setErrorLichess(error.message || 'Failed to fetch Lichess information.');
    } finally {
      setLoadingLichess(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [token]);

  useEffect(() => {
    fetchLichessInfo();
  }, [token]);

  return (
    <div style={styles.container}>
      <h2>Your Profile</h2>

      {/* Display User Balance */}
      <div style={styles.balanceSection}>
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
      </div>

      {/* Display Lichess Information */}
      <div style={styles.lichessSection}>
        <h3>Lichess Account</h3>
        {loadingLichess ? (
          <p>Loading Lichess information...</p>
        ) : errorLichess ? (
          <p style={styles.error}>{errorLichess}</p>
        ) : lichessInfo ? (
          <>
            <LichessInfo info={lichessInfo} />
            <DisconnectLichess />
          </>
        ) : (
          <p>Your Lichess account is not connected.</p>
        )}
      </div>

      {/* Display User Bets */}
      <YourBets />
    </div>
  );
};

// Inline Styles
const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: 'auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    marginTop: '50px',
  },
  balanceSection: {
    marginBottom: '30px',
    textAlign: 'center',
  },
  balance: {
    fontSize: '1.5em',
    fontWeight: 'bold',
  },
  lichessSection: {
    marginBottom: '30px',
    textAlign: 'center',
  },
  error: {
    color: 'red',
  },
};

export default Profile;

