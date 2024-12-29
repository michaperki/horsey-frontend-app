
// src/components/Auth/DisconnectLichess.js

import React, { useState } from 'react';

const DisconnectLichess = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Lichess account?')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please log in to disconnect your Lichess account.');
        setLoading(false);
        return;
      }

      const response = await fetch('/auth/lichess/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Lichess account disconnected successfully.');
        // Optionally, refresh user data or update global state here
        // For example, you might refetch user info or use a context
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage(data.error || 'Failed to disconnect Lichess account.');
      }
    } catch (error) {
      console.error('Error disconnecting Lichess account:', error);
      setMessage('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={handleDisconnect} style={styles.button} disabled={loading}>
        {loading ? 'Disconnecting...' : 'Disconnect Lichess Account'}
      </button>
      {message && <p>{message}</p>}
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
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default DisconnectLichess;
