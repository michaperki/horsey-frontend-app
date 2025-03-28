// Enhanced Home.js with proper integration

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLichess } from 'features/auth/contexts/LichessContext';
import { useProfile } from 'features/profile/contexts/ProfileContext';
import StatCard from 'features/layout/components/StatCard';
import GameModes from 'features/home/components/GameModes';
import './Home.css';

const Home = () => {
  const { lichessConnected, lichessUsername } = useLichess();
  const { profile, loading } = useProfile();
  const { openPlaceBetModal } = useOutletContext() || {};

  // Animation variants
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
                <span>{profile.karma || 0}</span>
              </div>
              <div className="welcome-info-item">
                <div className="welcome-info-icon">Membership:</div>
                <span>{profile.membership || 'Free'}</span>
              </div>
              <div className="welcome-info-item">
                <div className="welcome-info-icon">Rating Class:</div>
                <span>{profile.ratingClass || 'Beginner'}</span>
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
            <StatCard 
              title="Total Games Played" 
              value={profile.totalGames || 0} 
              icon="game"
            />
          </motion.div>
          <motion.div variants={statVariants}>
            <StatCard 
              title="Average Wager" 
              value={`${profile.averageWager || 0} PTK`} 
              icon="coin"
            />
          </motion.div>
          <motion.div variants={statVariants}>
            <StatCard 
              title="Total Wagered" 
              value={`${profile.totalWagered || 0} PTK`} 
              icon="money"
            />
          </motion.div>
          <motion.div variants={statVariants}>
            <StatCard 
              title="Average ROI" 
              value={`${profile.averageROI || '0.00'}%`} 
              icon="percentage"
            />
          </motion.div>
          <motion.div variants={statVariants}>
            <StatCard 
              title="Total Winnings" 
              value={`${profile.totalWinnings || 0} PTK`} 
              icon="win"
            />
          </motion.div>
          <motion.div variants={statVariants}>
            <StatCard 
              title="Total Losses" 
              value={`${profile.totalLosses || 0} PTK`} 
              icon="loss"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Game Modes with proper bet modal integration */}
      <GameModes openPlaceBetModal={openPlaceBetModal} />
    </div>
  );
};

export default Home;