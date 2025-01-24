
// src/pages/Home.js

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/api';
import StatCard from '../components/StatCard';
import './Home.css';

// Import React Icons for Home Options
import { FaChessKnight, FaChessKing, FaCoins } from 'react-icons/fa';

const Home = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  const [statistics, setStatistics] = useState({
    totalGames: 0,
    averageWager: 0,
    totalWagered: 0,
    averageROI: '0.00',
    totalWinnings: 0,
    totalLosses: 0,
    karma: 0,
    membership: 'Free',
    points: 0,
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
            Membership: {statistics.membership === 'Free' ? (
              <a href="/membership">Become a Member</a>
            ) : (
              'Premium'
            )}
          </div>
          <div className="info-item">Karma: {statistics.karma}</div>
          <div className="info-item">Points: {statistics.points}</div>
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
