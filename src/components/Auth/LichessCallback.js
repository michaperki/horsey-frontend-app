
// src/components/Auth/LichessCallback.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
        // Send the authorization code to the backend to exchange for tokens
        const response = await fetch('/auth/lichess/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage('Lichess account connected successfully!');
          // Optionally, you can refresh user data or update global state here
          // For example, you might refetch user info or use a context
          // Redirect to profile or dashboard after a delay
          setTimeout(() => navigate('/profile'), 2000);
        } else {
          setMessage(data.error || 'Failed to connect your Lichess account.');
        }
      } catch (error) {
        console.error('Error handling Lichess callback:', error);
        setMessage('An unexpected error occurred. Please try again.');
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
