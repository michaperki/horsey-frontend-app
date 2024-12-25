
// src/components/Profile.js
import React, { useEffect, useState } from 'react';
import { getUserBalance } from '../services/api';

const Profile = () => {
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token'); // Fetch token from local storage
        if (!token) throw new Error('User is not logged in');
        
        const userBalance = await getUserBalance(token);
        setBalance(userBalance);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  return (
    <div style={styles.container}>
      <h2>Your Profile</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {balance !== null && <p>Your Balance: {balance} PTK</p>}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '400px',
    margin: 'auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    marginTop: '50px',
    textAlign: 'center',
  },
};

export default Profile;

