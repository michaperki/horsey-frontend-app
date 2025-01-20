// src/components/Home.js

import React, { useEffect, useState } from 'react';
import LichessConnect from '../components/Auth/LichessConnect';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, disconnectLichessAccount } from '../services/api'; // Updated import
import PlaceBet from '../components/PlaceBet';

const Home = () => {
  const { token } = useAuth();
  const [lichessConnected, setLichessConnected] = useState(false);
  const [lichessUsername, setLichessUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile(token); // Implement this API call
        if (profile.lichessUsername) {
          setLichessConnected(true);
          setLichessUsername(profile.lichessUsername);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // Handle query parameters for connection status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('lichess') === 'connected') {
      setLichessConnected(true);
      // Optionally, fetch the updated profile again
    } else if (params.get('lichess') === 'error') {
      const message = params.get('message');
      alert(`Failed to connect Lichess account: ${message}`);
    }
  }, []);

  const handleDisconnect = async () => {
    const confirmDisconnect = window.confirm('Are you sure you want to disconnect your Lichess account?');
    if (!confirmDisconnect) return;

    setDisconnecting(true);

    try {
      await disconnectLichessAccount(token);
      setLichessConnected(false);
      setLichessUsername('');
      alert('Lichess account disconnected successfully.');
    } catch (error) {
      alert(`Failed to disconnect Lichess account: ${error.message}`);
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to Your Home</h1>
      {lichessConnected ? (
        <div style={styles.connected}>
          <p>Your Lichess account is connected as <strong>{lichessUsername}</strong>.</p>
          <button onClick={handleDisconnect} style={styles.disconnectButton} disabled={disconnecting}>
            {disconnecting ? 'Disconnecting...' : 'Disconnect Lichess Account'}
          </button>
          {/* Render PlaceBet only when Lichess is connected */}
          <PlaceBet />
        </div>
      ) : (
        <LichessConnect />
      )}
    </div>
  );
};

const styles = {
  connected: {
    marginTop: '20px',
    textAlign: 'center',
    color: 'green',
  },
  disconnectButton: {
    padding: '8px 16px',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '10px',
  },
};

export default Home;
