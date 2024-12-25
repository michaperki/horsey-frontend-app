
// src/components/Profile.js

import React, { useEffect, useState } from 'react';
import { getUserBalance } from '../services/api';
import YourBets from './YourBets'; // Import the YourBets component

const Profile = () => {
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [errorBalance, setErrorBalance] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      setLoadingBalance(true);
      setErrorBalance('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setErrorBalance('Please log in to view your balance.');
          return;
        }

        const userBalance = await getUserBalance(token);
        setBalance(userBalance);
      } catch (error) {
        setErrorBalance(error.message);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, []);

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
        ) : (
          <p style={styles.balance}>{balance} PTK</p>
        )}
      </div>

      {/* Display User Bets */}
      <YourBets />
    </div>
  );
};

// Inline Styles for Simplicity
const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    marginTop: "50px",
  },
  balanceSection: {
    marginBottom: "30px",
    textAlign: "center",
  },
  balance: {
    fontSize: "1.5em",
    fontWeight: "bold",
  },
  error: {
    color: "red",
  },
};

export default Profile;

