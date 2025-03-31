// src/features/leaderboard/components/SeasonBanner.js

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTrophy, 
  FaMedal, 
  FaCoins, 
  FaClock, 
  FaGamepad, 
  FaChartLine 
} from 'react-icons/fa';
import './SeasonBanner.css';

/**
 * Season Banner Component
 * Displays information about the current season and countdown timer
 * 
 * @param {Object} props.season - Season details
 * @param {Object} props.rewards - Season rewards
 * @param {Object} props.metadata - Season metadata
 * @param {Boolean} props.isActive - Whether this season is currently selected in the leaderboard
 */
const SeasonBanner = ({ season, rewards, metadata, isActive = false }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkForMobile = () => {
      setIsMobile(window.innerWidth <= 600);
      setIsExpanded(window.innerWidth > 600);
    };
    
    checkForMobile();
    window.addEventListener('resize', checkForMobile);
    
    return () => window.removeEventListener('resize', checkForMobile);
  }, []);

  // Calculate time remaining
  useEffect(() => {
    if (!season?.endDate) return;
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const endDate = new Date(season.endDate);
      const totalSeconds = Math.max(0, Math.floor((endDate - now) / 1000));
      
      if (totalSeconds <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(totalSeconds / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      const seconds = Math.floor(totalSeconds % 60);

      return { days, hours, minutes, seconds };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [season]);

  // Determine if season is ending soon (less than 1 day)
  const isEndingSoon = timeRemaining.days === 0 && timeRemaining.hours < 24;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 70, 
        damping: 12,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (!season || !rewards || !metadata) {
    return null;
  }
  
  return (
    <motion.div 
      className={`season-banner ${isActive ? 'season-banner-active' : ''} ${isEndingSoon ? 'season-ending-soon' : ''}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Season header */}
      <div className="season-header">
        <motion.div className="season-title" variants={itemVariants}>
          <FaTrophy className="season-icon" />
          <div className="season-info">
            <h2>{season.name || 'Current Season'}</h2>
            <p className="season-dates">
              {formatDate(season.startDate)} - {formatDate(season.endDate)}
            </p>
          </div>
        </motion.div>

        {/* Timer section */}
        <motion.div className="season-timer" variants={itemVariants}>
          <div className="timer-label">
            <FaClock />
            <span>Season Ends In:</span>
          </div>
          <div className="countdown-timer">
            <div className="time-unit">
              <span className="time-value">{timeRemaining.days}</span>
              <span className="time-label">Days</span>
            </div>
            <div className="timer-divider">:</div>
            <div className="time-unit">
              <span className="time-value">{timeRemaining.hours.toString().padStart(2, '0')}</span>
              <span className="time-label">Hours</span>
            </div>
            <div className="timer-divider">:</div>
            <div className="time-unit">
              <span className="time-value">{timeRemaining.minutes.toString().padStart(2, '0')}</span>
              <span className="time-label">Min</span>
            </div>
            <div className="timer-divider">:</div>
            <div className="time-unit">
              <span className="time-value">{timeRemaining.seconds.toString().padStart(2, '0')}</span>
              <span className="time-label">Sec</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Season details - conditionally shown based on expanded state */}
      {isExpanded && (
        <motion.div 
          className="season-details"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Rewards */}
          <motion.div className="season-section rewards-section" variants={itemVariants}>
            <h3 className="section-title">Season Rewards</h3>
            <div className="rewards">
              <div className="reward-item">
                <div className="reward-rank gold">
                  <FaTrophy />
                  <span>1st</span>
                </div>
                <div className="reward-value">
                  <div><FaCoins className="token-icon" /> {rewards.firstPlace?.tokens || 0} Tokens</div>
                  <div>{rewards.firstPlace?.sweepstakes || 0} Sweepstakes</div>
                </div>
              </div>
              <div className="reward-item">
                <div className="reward-rank silver">
                  <FaMedal />
                  <span>2nd</span>
                </div>
                <div className="reward-value">
                  <div><FaCoins className="token-icon" /> {rewards.secondPlace?.tokens || 0} Tokens</div>
                  <div>{rewards.secondPlace?.sweepstakes || 0} Sweepstakes</div>
                </div>
              </div>
              <div className="reward-item">
                <div className="reward-rank bronze">
                  <FaMedal />
                  <span>3rd</span>
                </div>
                <div className="reward-value">
                  <div><FaCoins className="token-icon" /> {rewards.thirdPlace?.tokens || 0} Tokens</div>
                  <div>{rewards.thirdPlace?.sweepstakes || 0} Sweepstakes</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div className="season-section stats-section" variants={itemVariants}>
            <h3 className="section-title">Season Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <FaGamepad className="stat-icon" />
                <div className="stat-info">
                  <div className="stat-value">{metadata.totalGames || 0}</div>
                  <div className="stat-label">Games Played</div>
                </div>
              </div>
              <div className="stat-item">
                <FaChartLine className="stat-icon" />
                <div className="stat-info">
                  <div className="stat-value">{metadata.totalBets || 0}</div>
                  <div className="stat-label">Total Bets</div>
                </div>
              </div>
              <div className="stat-item">
                <FaCoins className="stat-icon token" />
                <div className="stat-info">
                  <div className="stat-value">{(metadata.totalTokensWagered || 0).toLocaleString()}</div>
                  <div className="stat-label">Tokens Wagered</div>
                </div>
              </div>
              <div className="stat-item">
                <FaCoins className="stat-icon sweepstakes" />
                <div className="stat-info">
                  <div className="stat-value">{(metadata.totalSweepstakesWagered || 0).toLocaleString()}</div>
                  <div className="stat-label">Sweepstakes Wagered</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Toggle button - only shown on mobile */}
      {isMobile && (
        <button 
          className="toggle-season-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide Season Details' : 'Show Season Details'}
        </button>
      )}
    </motion.div>
  );
};

export default SeasonBanner;
