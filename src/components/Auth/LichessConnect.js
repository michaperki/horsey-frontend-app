// frontend/src/components/LichessConnect.js

import React, { useState } from 'react';
import { initiateLichessOAuth } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const LichessConnect = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useAuth(); // Retrieve the JWT token from your Auth context or state

  const handleConnect = () => {
    if (!token) {
      setError('You must log in to connect your Lichess account.');
      return;
    }

    // Initiate the OAuth process by redirecting the user with the token
    initiateLichessOAuth(token);
  };

  return (
    <div style={styles.container}>
      <button onClick={handleConnect} style={styles.button} disabled={loading}>
        {loading ? 'Connecting...' : 'Connect Your Lichess Account'}
      </button>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

const styles = {
  container: {
    marginTop: '20px',
    textAlign: 'center',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    disabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
    },
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};

export default LichessConnect;
