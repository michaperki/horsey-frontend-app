
// src/pages/Home.js

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/api';
import StatCard from '../components/StatCard';
import './Home.css';

// Import necessary Font Awesome icons
import {
  faGamepad,
  faTrophy,
  faCoins,
  faBalanceScale,
  faDollarSign,
  faChartLine,
  faPercentage,
  faArrowUp,
  faArrowDown,
  faMedal,
  faCrown,
  faHeart,
  faSmile,
  faStar,
  faGift,
} from '@fortawesome/free-solid-svg-icons';

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
          <StatCard
            title="Total Games Played"
            value={statistics.totalGames}
            icon={faGamepad}
          />
          <StatCard
            title="Average Wager"
            value={`${statistics.averageWager} PTK`}
            icon={faCoins}
          />
          <StatCard
            title="Total Wagered"
            value={`${statistics.totalWagered} PTK`}
            icon={faDollarSign}
          />
          <StatCard
            title="Average ROI"
            value={`${statistics.averageROI}%`}
            icon={faChartLine}
          />
          <StatCard
            title="Total Winnings"
            value={`${statistics.totalWinnings} PTK`}
            icon={faTrophy}
          />
          <StatCard
            title="Total Losses"
            value={`${statistics.totalLosses} PTK`}
            icon={faArrowDown}
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
          <div className="ranked-options">
            <div className="card">
              <h3>Classic Blitz</h3>
              <p>Our most popular game mode!</p>
            </div>
            <div className="card">
              <h3>Crazy House</h3>
              <p>Experience the dynamic gameplay of Crazy House!</p>
            </div>
            <div className="card">
              <h3>Chess 960</h3>
              <p>Experience the chaos of random piece setups!</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;

