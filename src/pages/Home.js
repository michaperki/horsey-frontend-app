
// src/pages/Home.js

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, createNotification } from '../services/api';
import StatCard from '../components/StatCard';
import PlaceBetModal from '../components/PlaceBetModal';
import './Home.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { FaChessKnight, FaChessKing, FaCoins } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useLichess } from '../contexts/LichessContext'; // Import Lichess context

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
    username: 'User',
  });

  const [isPlaceBetModalOpen, setIsPlaceBetModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const navigate = useNavigate();
  const { lichessConnected, triggerShake } = useLichess(); // Destructure Lichess context

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

  const openPlaceBetModal = (variant) => {
    if (!lichessConnected) {
      // Trigger shake animation and display notification
      triggerShake();
      createNotification({
        message: 'Please connect your Lichess account before placing a bet.',
        type: 'warning',
      });
      return;
    }
    setSelectedVariant(variant);
    setIsPlaceBetModalOpen(true);
  };

  const closePlaceBetModal = () => {
    setSelectedVariant(null);
    setIsPlaceBetModalOpen(false);
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
          <div className="info-item">Karma: {statistics.karma}</div>
        </div>
      </header>

      <div className="content">
        <main className="main">
          <div className="home-options">
            {/* Classic Blitz Card */}
            <div
              className="card clickable-card"
              onClick={() => openPlaceBetModal('standard')}
            >
              <div className="icon"><FaChessKnight /></div>
              <div>
                <h3>Classic Blitz</h3>
                <p>Our most popular game mode!</p>
              </div>
            </div>

            {/* Chess 960 Card */}
            <div
              className="card clickable-card"
              onClick={() => openPlaceBetModal('chess960')}
            >
              <div className="icon"><FaChessKing /></div>
              <div>
                <h3>Chess 960</h3>
                <p>Pieces start on random squares!</p>
              </div>
            </div>

            {/* Play for Horsey Coins Card */}
            <div
              className="card clickable-card"
              onClick={() => openPlaceBetModal(null)}
            >
              <div className="icon"><FaCoins /></div>
              <div>
                <h3>Play for Horsey Coins</h3>
                <button
                  className="get-coins-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering card's onClick
                    navigate('/store'); // Navigate to store page
                  }}
                >
                  Get Coins
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* PlaceBetModal Component */}
      <PlaceBetModal
        isOpen={isPlaceBetModalOpen}
        onClose={closePlaceBetModal}
        preSelectedVariant={selectedVariant}
      />
    </div>
  );
};

export default Home;

