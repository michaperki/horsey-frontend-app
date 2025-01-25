
// src/pages/Home.js

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, createNotification } from '../services/api'; // Import createNotification
import StatCard from '../components/StatCard';
import './Home.css';
import 'react-loading-skeleton/dist/skeleton.css'; // Import skeleton styles
// Import React Icons for Home Options
import { FaChessKnight, FaChessKing, FaCoins } from 'react-icons/fa';

const Home = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false); // Loading state for the button
  const [buttonError, setButtonError] = useState(null); // Error state for the button

  const [statistics, setStatistics] = useState({
    totalGames: 0,
    averageWager: 0,
    totalWagered: 0,
    averageROI: '0.00',
    totalWinnings: 0,
    totalLosses: 0,
    karma: 0,
    membership: 'Free',
    username: 'User',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile(token);
        const { statistics, username } = response;

        setStatistics({ ...statistics, username });
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleBecomeMember = async () => {
    setButtonLoading(true);
    setButtonError(null);
    try {
      await createNotification({
        message: 'Membership coming soon!',
        type: 'membership', // You can define a new type if needed
      });
      // Optionally, provide user feedback
      alert('Notification triggered: "Membership coming soon!"');
    } catch (error) {
      console.error('Error creating notification:', error);
      setButtonError('Failed to trigger notification. Please try again.');
    } finally {
      setButtonLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-container">
      <header className="header">
        <div className="stats-grid">
          <StatCard title="Total Games Played" value={statistics.totalGames} />
          <StatCard
            title="Average Wager"
            value={`${statistics.averageWager} PTK`}
          />
          <StatCard
            title="Total Wagered"
            value={`${statistics.totalWagered} PTK`}
          />
          <StatCard title="Average ROI" value={`${statistics.averageROI}%`} />
          <StatCard
            title="Total Winnings"
            value={`${statistics.totalWinnings} PTK`}
          />
          <StatCard
            title="Total Losses"
            value={`${statistics.totalLosses} PTK`}
          />
        </div>
        <div className="additional-info">
          <div className="info-item">
            Membership:{' '}
            {statistics.membership === 'Free' ? (
              <button
                className="become-member-button"
                onClick={handleBecomeMember}
                disabled={buttonLoading}
              >
                {buttonLoading ? 'Processing...' : 'Become a Member'}
              </button>
            ) : (
              'Premium'
            )}
            {buttonError && <p className="error-message">{buttonError}</p>}
          </div>
          <div className="info-item">Karma: {statistics.karma}</div>
        </div>
      </header>

      <div className="content">
        <main className="main">
          <div className="home-options">
            <div className="card">
              <div className="icon"><FaChessKnight /></div>
              <div>
                <h3>Classic Blitz</h3>
                <p>Our most popular game mode!</p>
              </div>
            </div>
            <div className="card">
              <div className="icon"><FaChessKing /></div>
              <div>
                <h3>Crazy House</h3>
                <p>Place pieces that you capture!</p>
              </div>
            </div>
            <div className="card">
              <div className="icon"><FaCoins /></div>
              <div>
                <h3>Play for Horsey Coins</h3>
                <button className="get-coins-button">Get Coins</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;

