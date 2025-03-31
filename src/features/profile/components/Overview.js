// src/features/profile/components/Overview.js

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/contexts/AuthContext';
import { getUserBalances } from '../services/api';
import { useToken } from '../../token/contexts/TokenContext';
import { ApiError } from '../../common/components/ApiError';
import { useProfile } from '../contexts/ProfileContext';
import { 
  FaCoins, 
  FaChessKnight, 
  FaTrophy, 
  FaDice, 
  FaChartLine, 
  FaPercentage
} from 'react-icons/fa';
import './Overview.css';

const Overview = () => {
  const { token } = useAuth();
  const { tokenBalance, sweepstakesBalance, updateTokenBalance, updateSweepstakesBalance } = useToken();
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [errorBalance, setErrorBalance] = useState(null);
  const { profile } = useProfile();

  const fetchBalances = useCallback(async () => {
    setLoadingBalance(true);
    setErrorBalance(null);
    try {
      if (!token) throw new Error('Please log in to view your balances.');
      const { tokenBalance, sweepstakesBalance } = await getUserBalances();
      updateTokenBalance(tokenBalance);
      updateSweepstakesBalance(sweepstakesBalance);
    } catch (error) {
      setErrorBalance({ code: 'BALANCE_ERROR', message: error.message || 'Failed to fetch balances.' });
    } finally {
      setLoadingBalance(false);
    }
  }, [token, updateTokenBalance, updateSweepstakesBalance]);

  useEffect(() => {
    if (token) {
      fetchBalances();
    } else {
      updateTokenBalance(0);
      updateSweepstakesBalance(0);
      setErrorBalance(null);
    }
  }, [token, fetchBalances, updateTokenBalance, updateSweepstakesBalance]);

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

  // Mock data for stats when profile is not fully loaded
  const stats = {
    totalGames: profile?.totalGames || 0,
    winRate: profile?.averageROI ? `${parseFloat(profile.averageROI).toFixed(2)}%` : '0.00%',
    totalWagered: profile?.totalWagered || 0,
    totalWinnings: profile?.totalWinnings || 0,
    totalLosses: profile?.totalLosses || 0,
    averageWager: profile?.averageWager || 0
  };

  return (
    <motion.div 
      className="overview-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="overview-title">Account Overview</h2>

      {/* Balance Section */}
      <motion.div className="overview-section balance-section" variants={itemVariants}>
        <h3 className="section-title">
          <FaCoins className="section-icon" />
          <span>Your Balances</span>
        </h3>
        
        <div className="balance-cards-grid">
          <motion.div 
            className="balance-stat-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="card-header token">
              <FaCoins className="card-icon" />
              <h4>Token Balance</h4>
            </div>
            {loadingBalance ? (
              <div className="loading-spinner"></div>
            ) : errorBalance ? (
              <ApiError error={errorBalance} onDismiss={() => setErrorBalance(null)} onRetry={fetchBalances} compact />
            ) : (
              <div className="balance-value token">{tokenBalance} PTK</div>
            )}
          </motion.div>
          
          <motion.div 
            className="balance-stat-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="card-header sweepstakes">
              <FaChessKnight className="card-icon" />
              <h4>Sweepstakes Balance</h4>
            </div>
            {loadingBalance ? (
              <div className="loading-spinner"></div>
            ) : errorBalance ? (
              <ApiError error={errorBalance} onDismiss={() => setErrorBalance(null)} onRetry={fetchBalances} compact />
            ) : (
              <div className="balance-value sweepstakes">{sweepstakesBalance} SWP</div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Performance Stats Section */}
      <motion.div className="overview-section stats-section" variants={itemVariants}>
        <h3 className="section-title">
          <FaChartLine className="section-icon" />
          <span>Performance Statistics</span>
        </h3>
        
        <div className="stats-grid">
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-icon-wrapper">
              <FaDice />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.totalGames}</div>
              <div className="stat-label">Total Games</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-icon-wrapper">
              <FaPercentage />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.winRate}</div>
              <div className="stat-label">ROI</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-icon-wrapper">
              <FaCoins />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.totalWagered}</div>
              <div className="stat-label">Total Wagered</div>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="stat-icon-wrapper win">
              <FaTrophy />
            </div>
            <div className="stat-details">
              <div className="stat-value">{stats.totalWinnings}</div>
              <div className="stat-label">Total Winnings</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Recent Activity Section - For future implementation */}
      <motion.div className="overview-section activity-section" variants={itemVariants}>
        <h3 className="section-title">
          <FaChartLine className="section-icon" />
          <span>Recent Activity</span>
        </h3>
        
        <div className="activity-placeholder">
          <p>No recent activity to display. Start placing bets to see your activity here!</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Overview;
