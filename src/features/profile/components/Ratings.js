// src/features/profile/components/Ratings.js

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChessKing, FaChessQueen, FaChessBishop, FaChessKnight, FaChessRook, FaChessPawn, FaChartLine } from 'react-icons/fa';
import './Ratings.css';

const Ratings = () => {
  const [activeTimeControl, setActiveTimeControl] = useState('blitz');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  // Mock data for ratings when profile is not fully loaded
  // In a real app, this would come from your API
  const ratingData = {
    blitz: {
      current: 1650,
      peak: 1720,
      history: [1600, 1625, 1590, 1610, 1650, 1625, 1640, 1650],
      gamesPlayed: 124,
      wins: 62,
      losses: 42,
      draws: 20,
      winRate: 50
    },
    rapid: {
      current: 1720,
      peak: 1820,
      history: [1650, 1675, 1700, 1710, 1720, 1700, 1720, 1720],
      gamesPlayed: 86,
      wins: 48,
      losses: 31,
      draws: 7,
      winRate: 56
    },
    classical: {
      current: 1850,
      peak: 1900,
      history: [1800, 1825, 1840, 1850, 1820, 1830, 1845, 1850],
      gamesPlayed: 42,
      wins: 28,
      losses: 10,
      draws: 4,
      winRate: 67
    },
    bullet: {
      current: 1520,
      peak: 1600,
      history: [1500, 1520, 1480, 1510, 1520, 1500, 1515, 1520],
      gamesPlayed: 210,
      wins: 105,
      losses: 95,
      draws: 10,
      winRate: 50
    }
  };

  // Get active rating data
  const activeRating = ratingData[activeTimeControl] || ratingData.blitz;

  return (
    <motion.div 
      className="ratings-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2 
        className="ratings-title"
        variants={itemVariants}
      >
        Rating Statistics
      </motion.h2>
      
      {/* Time Control Selector */}
      <motion.div 
        className="time-control-selector"
        variants={itemVariants}
      >
        <button 
          className={`time-control-btn ${activeTimeControl === 'bullet' ? 'active' : ''}`}
          onClick={() => setActiveTimeControl('bullet')}
        >
          <FaChessPawn className="time-icon" />
          <span>Bullet</span>
        </button>
        <button 
          className={`time-control-btn ${activeTimeControl === 'blitz' ? 'active' : ''}`}
          onClick={() => setActiveTimeControl('blitz')}
        >
          <FaChessKnight className="time-icon" />
          <span>Blitz</span>
        </button>
        <button 
          className={`time-control-btn ${activeTimeControl === 'rapid' ? 'active' : ''}`}
          onClick={() => setActiveTimeControl('rapid')}
        >
          <FaChessBishop className="time-icon" />
          <span>Rapid</span>
        </button>
        <button 
          className={`time-control-btn ${activeTimeControl === 'classical' ? 'active' : ''}`}
          onClick={() => setActiveTimeControl('classical')}
        >
          <FaChessQueen className="time-icon" />
          <span>Classical</span>
        </button>
      </motion.div>
      
      {/* Main Rating Display */}
      <motion.div 
        className="main-rating-display"
        variants={itemVariants}
      >
        <div className="rating-header">
          <FaChessKing className="rating-header-icon" />
          <h3>{activeTimeControl.charAt(0).toUpperCase() + activeTimeControl.slice(1)} Rating</h3>
        </div>
        
        <div className="rating-values">
          <motion.div 
            className="rating-value-card current"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <span className="rating-number">{activeRating.current}</span>
            <span className="rating-label">Current Rating</span>
          </motion.div>
          
          <motion.div 
            className="rating-value-card peak"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <span className="rating-number">{activeRating.peak}</span>
            <span className="rating-label">Peak Rating</span>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Rating Chart */}
      <motion.div 
        className="rating-chart-section"
        variants={itemVariants}
      >
        <div className="section-header">
          <FaChartLine className="section-icon" />
          <h3>Rating History</h3>
        </div>
        
        <div className="chart-container">
          {/* Chart placeholder - in a real app, you'd use a charting library like recharts */}
          <div className="chart-placeholder">
            <div className="chart-bars">
              {activeRating.history.map((rating, index) => {
                const height = ((rating - 1400) / 500) * 100; // Scale for visualization
                return (
                  <motion.div 
                    key={index}
                    className="chart-bar"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                  >
                    <span className="bar-tooltip">{rating}</span>
                  </motion.div>
                );
              })}
            </div>
            <div className="chart-labels">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((month, index) => (
                <div key={index} className="chart-label">{month}</div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Performance Stats */}
      <motion.div 
        className="performance-stats-section"
        variants={itemVariants}
      >
        <div className="section-header">
          <FaChessRook className="section-icon" />
          <h3>Performance Stats</h3>
        </div>
        
        <div className="stats-grid">
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-details">
              <div className="stat-value">{activeRating.gamesPlayed}</div>
              <div className="stat-label">Games Played</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-details">
              <div className="stat-value win">{activeRating.wins}</div>
              <div className="stat-label">Wins</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-details">
              <div className="stat-value loss">{activeRating.losses}</div>
              <div className="stat-label">Losses</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-details">
              <div className="stat-value draw">{activeRating.draws}</div>
              <div className="stat-label">Draws</div>
            </div>
          </motion.div>
        </div>
        
        {/* Win rate progress bar */}
        <div className="win-rate-container">
          <div className="win-rate-label">
            <span>Win Rate</span>
            <span className="win-rate-percent">{activeRating.winRate}%</span>
          </div>
          <div className="win-rate-progress">
            <motion.div 
              className="win-rate-bar"
              initial={{ width: 0 }}
              animate={{ width: `${activeRating.winRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            ></motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Ratings;
