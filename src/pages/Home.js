
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
import { useLichess } from '../contexts/LichessContext';

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
  const { lichessConnected, lichessUsername, triggerShake } = useLichess();

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
    return <div className="flex-center h-screen text-xl text-primary">Loading...</div>;
  }

  return (
    <div className="p-sm">
      {/* Removed additional header to prevent redundancy */}
      <div className="lichess-greeting mb-md text-center">
        {lichessConnected ? (
          <h2 className="text-white font-bold text-xl">Welcome back, {lichessUsername || statistics.username}!</h2>
        ) : (
          <h2 className="text-white font-bold text-xl">Welcome! Please connect your Lichess account.</h2>
        )}
      </div>

      <div className="stats-grid">
        <StatCard title="Total Games Played" value={statistics.totalGames} />
        <StatCard title="Average Wager" value={`${statistics.averageWager} PTK`} />
        <StatCard title="Total Wagered" value={`${statistics.totalWagered} PTK`} />
        <StatCard title="Average ROI" value={`${statistics.averageROI}%`} />
        <StatCard title="Total Winnings" value={`${statistics.totalWinnings} PTK`} />
        <StatCard title="Total Losses" value={`${statistics.totalLosses} PTK`} />
      </div>

      <div className="additional-info">
        <div className="info-item">Karma: {statistics.karma}</div>
      </div>

      <main className="main">
        <div className="home-options flex items-center gap-5">
          {/* Classic Blitz Card */}
          <div
            className="card flex items-center justify-between bg-secondary border border-gray-300 rounded-md p-md shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            onClick={() => openPlaceBetModal('standard')}
          >
            <div className="icon text-2xl text-yellow-400 mr-4">
              <FaChessKnight />
            </div>
            <div>
              <h3 className="text-yellow-400 font-semibold">Classic Blitz</h3>
              <p className="text-white text-sm">Our most popular game mode!</p>
            </div>
          </div>

          {/* Chess 960 Card */}
          <div
            className="card flex items-center justify-between bg-secondary border border-gray-300 rounded-md p-md shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            onClick={() => openPlaceBetModal('chess960')}
          >
            <div className="icon text-2xl text-yellow-400 mr-4">
              <FaChessKing />
            </div>
            <div>
              <h3 className="text-yellow-400 font-semibold">Chess 960</h3>
              <p className="text-white text-sm">Pieces start on random squares!</p>
            </div>
          </div>

          {/* Play for Horsey Coins Card */}
          <div
            className="card flex items-center justify-between bg-secondary border border-gray-300 rounded-md p-md shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            onClick={() => openPlaceBetModal(null)}
          >
            <div className="icon text-2xl text-yellow-400 mr-4">
              <FaCoins />
            </div>
            <div className="flex flex-col">
              <h3 className="text-yellow-400 font-semibold">Play for Horsey Coins</h3>
              <button
                className="btn btn-primary get-coins-button mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/store');
                }}
              >
                Get Coins
              </button>
            </div>
          </div>
        </div>
      </main>

      <PlaceBetModal
        isOpen={isPlaceBetModalOpen}
        onClose={closePlaceBetModal}
        preSelectedVariant={selectedVariant}
      />
    </div>
  );
};

export default Home;

