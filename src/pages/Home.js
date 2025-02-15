
// src/pages/Home.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChessKnight, FaChessKing, FaCoins } from 'react-icons/fa';
import StatCard from '../components/StatCard';
import PlaceBetModal from '../components/PlaceBetModal';
import UserGreetingInfo from '../components/UserGreetingInfo';
import './Home.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { useLichess } from '../contexts/LichessContext';
import { useProfile } from '../contexts/ProfileContext';

const Home = () => {
  const { lichessConnected, lichessUsername, triggerShake } = useLichess();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();
  const [isPlaceBetModalOpen, setIsPlaceBetModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const openPlaceBetModal = (variant) => {
    if (!lichessConnected) {
      triggerShake();
      // Optionally show a notification here.
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
      <UserGreetingInfo
        lichessConnected={lichessConnected}
        lichessUsername={lichessUsername}
        statistics={profile}
      />

      {lichessConnected && (
        <div className="stats-grid">
          <StatCard title="Total Games Played" value={profile.totalGames} />
          <StatCard title="Average Wager" value={`${profile.averageWager} PTK`} />
          <StatCard title="Total Wagered" value={`${profile.totalWagered} PTK`} />
          <StatCard title="Average ROI" value={`${profile.averageROI}%`} />
          <StatCard title="Total Winnings" value={`${profile.totalWinnings} PTK`} />
          <StatCard title="Total Losses" value={`${profile.totalLosses} PTK`} />
        </div>
      )}

      <main className="main">
        <div className="home-options flex items-center gap-5">
          <div
            className="card flex items-center justify-between bg-secondary border border-gray-300 rounded-md p-sm shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            onClick={() => openPlaceBetModal('standard')}
          >
            <div className="icon text-2xl text-yellow-400 mr-4">
              <FaChessKnight />
            </div>
            <div>
              <h3 className="text-yellow-400 font-semibold text-sm">Classic Blitz</h3>
              <p className="text-white text-xs">Our most popular game mode!</p>
            </div>
          </div>

          <div
            className="card flex items-center justify-between bg-secondary border border-gray-300 rounded-md p-sm shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            onClick={() => openPlaceBetModal('chess960')}
          >
            <div className="icon text-2xl text-yellow-400 mr-4">
              <FaChessKing />
            </div>
            <div>
              <h3 className="text-yellow-400 font-semibold text-sm">Chess 960</h3>
              <p className="text-white text-xs">Pieces start on random squares!</p>
            </div>
          </div>

          <div
            className="card flex items-center justify-between bg-secondary border border-gray-300 rounded-md p-sm shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            onClick={() => openPlaceBetModal(null)}
          >
            <div className="icon text-2xl text-yellow-400 mr-4">
              <FaCoins />
            </div>
            <div className="flex flex-col">
              <h3 className="text-yellow-400 font-semibold text-sm">Play for Horsey Coins</h3>
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
