// src/features/home/pages/Home.js
import React, { useState } from 'react';
import { motion } from 'framer-motion'; // Note: You'll need to install framer-motion
import { useLichess } from '../../auth/contexts/LichessContext';
import { useProfile } from '../../profile/contexts/ProfileContext';
import StatCard from '../../layout/components/StatCard'; // Import the StatCard component
import PlaceBetModal from '../../betting/components/PlaceBetModal';
import GameModes from '../components/GameModes'; // Import the new GameModes component
import './Home.css';

const Home = () => {
  const { lichessConnected, lichessUsername } = useLichess();
  const { profile, loading } = useProfile();
  const [isPlaceBetModalOpen, setIsPlaceBetModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const openPlaceBetModal = (variant) => {
    setSelectedVariant(variant);
    setIsPlaceBetModalOpen(true);
  };

  const closePlaceBetModal = () => {
    setSelectedVariant(null);
    setIsPlaceBetModalOpen(false);
  };

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const statVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 150, delay: 0.2 }
    }
  };

  if (loading) {
    return (
      <div className="flex-center h-screen">
        <div className="spinner-container">
          <div className="spinner"></div>
          <p className="text-xl text-white mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container p-4">
      <motion.div 
        className="welcome-section"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {lichessConnected ? (
          <>
            <motion.h2 variants={containerVariants} className="text-xl font-bold">
              Welcome back, <span className="text-yellow-400">{lichessUsername || profile.username}!</span>
            </motion.h2>
            <motion.div variants={containerVariants} className="welcome-info mt-3">
              <div className="welcome-info-item">
                <div className="welcome-info-icon">Karma:</div>
                <span>{profile.karma}</span>
              </div>
              <div className="welcome-info-item">
                <div className="welcome-info-icon">Membership:</div>
                <span>{profile.membership}</span>
              </div>
              <div className="welcome-info-item">
                <div className="welcome-info-icon">Rating Class:</div>
                <span>{profile.ratingClass}</span>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.h2 variants={containerVariants} className="text-xl font-bold">
            Welcome! Please connect your Lichess account.
          </motion.h2>
        )}
      </motion.div>

      {lichessConnected && (
        <motion.div 
          className="stats-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={statVariants}>
            <StatCard title="Total Games Played" value={profile.totalGames} />
          </motion.div>
          <motion.div variants={statVariants}>
            <StatCard title="Average Wager" value={`${profile.averageWager} PTK`} />
          </motion.div>
          <motion.div variants={statVariants}>
            <StatCard title="Total Wagered" value={`${profile.totalWagered} PTK`} />
          </motion.div>
          <motion.div variants={statVariants}>
            <StatCard title="Average ROI" value={`${profile.averageROI}%`} />
          </motion.div>
          <motion.div variants={statVariants}>
            <StatCard title="Total Winnings" value={`${profile.totalWinnings} PTK`} />
          </motion.div>
          <motion.div variants={statVariants}>
            <StatCard title="Total Losses" value={`${profile.totalLosses} PTK`} />
          </motion.div>
        </motion.div>
      )}

      {/* Use the new GameModes component */}
      <GameModes openPlaceBetModal={openPlaceBetModal} />

      <PlaceBetModal
        isOpen={isPlaceBetModalOpen}
        onClose={closePlaceBetModal}
        preSelectedVariant={selectedVariant}
      />
    </div>
  );
};

export default Home;