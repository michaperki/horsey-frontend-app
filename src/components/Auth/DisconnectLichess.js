// src/components/Auth/DisconnectLichess.js

import React from 'react';
import PropTypes from 'prop-types';
import { disconnectLichessAccount } from '../../services/api'; // Implement this API call
import { useAuth } from '../../contexts/AuthContext';

const DisconnectLichess = ({ onDisconnect }) => {
  const { token } = useAuth() || {}; // Provide a default empty object
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleDisconnect = async () => {
    if (!token) {
      setError('Please log in to disconnect your Lichess account.');
      return;
    }

    const confirmDisconnect = window.confirm('Are you sure you want to disconnect your Lichess account?');
    if (!confirmDisconnect) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      await disconnectLichessAccount(token);
      if (onDisconnect) {
        onDisconnect();
      }
    } catch (err) {
      setError(err.message || 'Failed to disconnect Lichess account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {error && <p style={styles.error}>{error}</p>}
      <button onClick={handleDisconnect} style={styles.button} disabled={loading}>
        {loading ? 'Disconnecting...' : 'Disconnect Lichess'}
      </button>
    </div>
  );
};

DisconnectLichess.propTypes = {
  onDisconnect: PropTypes.func,
};

const styles = {
  container: {
    marginTop: '15px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
};

export default DisconnectLichess;
