
// src/components/Auth/LichessCallback.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { lichessCallback } from '../../services/api';

const LichessCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('Processing your connection...');

  useEffect(() => {
    const handleCallback = async () => {
      const queryParams = new URLSearchParams(location.search);
      const code = queryParams.get('code');
      const state = queryParams.get('state');

      if (!code) {
        setMessage('Authorization code not found. Please try connecting again.');
        return;
      }

      try {
        const response = await lichessCallback({ code, state });

        setMessage('Lichess account connected successfully!');
        // Optionally refresh user data or update global state here
        setTimeout(() => navigate('/profile'), 2000);
      } catch (error) {
        console.error('Error handling Lichess callback:', error);
        setMessage(error.message || 'Failed to connect your Lichess account.');
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div style={styles.container}>
      <h2>Lichess Connection</h2>
      <p>{message}</p>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '400px',
    margin: 'auto',
    textAlign: 'center',
    marginTop: '50px',
    backgroundColor: '#f1f1f1',
    borderRadius: '8px',
  },
};

export default LichessCallback;

