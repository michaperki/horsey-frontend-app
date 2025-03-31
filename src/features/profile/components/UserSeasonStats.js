// src/features/profile/components/UserSeasonStats.js
import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaTrophy, 
  FaCalendarAlt, 
  FaClock,
  FaCoins,
  FaChessKnight,
  FaExclamationCircle,
  FaSpinner,
  FaSyncAlt
} from 'react-icons/fa';
import { useSeason } from '../../seasons/contexts/SeasonContext';
import './UserSeasonStats.css';

const UserSeasonStats = () => {
  const { 
    activeSeason, 
    userSeasonStats,
    loading,
    error,
    fetchActiveSeason,
    fetchUserSeasonStats
  } = useSeason();

  if (loading) {
    return (
      <div className="user-season-stats-container loading">
        <div className="stats-loading">
          <FaSpinner className="spinner-icon" />
          <p>Loading season stats...</p>
        </div>
      </div>
    );
  }

  if (error && !activeSeason) {
    return (
      <div className="user-season-stats-container error">
        <div className="stats-error">
          <FaExclamationCircle className="error-icon" />
          <p>Failed to load season stats</p>
          <button onClick={fetchActiveSeason} className="retry-button">
            <FaSyncAlt /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!activeSeason) {
    return (
      <div className="user-season-stats-container empty">
        <div className="stats-empty">
          <FaCalendarAlt className="empty-icon" />
          <p>No active season found</p>
          <button onClick={fetchActiveSeason} className="retry-button">
            <FaSyncAlt /> Check again
          </button>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (activeSeason && activeSeason.season && activeSeason.season.timeRemaining) {
      return Math.max(0, Math.floor(activeSeason.season.timeRemaining.days));
    }
    return 0;
  };

  // Get season data
  const season = activeSeason.season;
  const rewards = activeSeason.rewards;
  
  // Get user stats (or set defaults)
  const stats = userSeasonStats?.stats || {
    tokens: {
      balance: 0,
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      wagered: 0,
      earned: 0,
      netProfit: 0,
      rank: 0
    },
    sweepstakes: {
      balance: 0,
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      wagered: 0,
      earned: 0,
      netProfit: 0,
      rank: 0
    },
    rewards: {
      tokens: 0,
      sweepstakes: 0
    },
    achievements: []
  };

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

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  return (
    <motion.div 
      className="user-season-stats-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Season Header */}
      <motion.div className="season-stats-header" variants={cardVariants}>
        <div className="season-info">
          <FaTrophy className="season-icon" />
          <div>
            <h3>{season.name}</h3>
            <p className="season-dates">
              {formatDate(season.startDate)} - {formatDate(season.endDate)}
            </p>
          </div>
        </div>
        <div className="days-remaining">
          <FaClock className="clock-icon" />
          <div>
            <span className="days-count">{getDaysRemaining()}</span>
            <span>Days Left</span>
          </div>
        </div>
      </motion.div>

      {/* Token Stats */}
      <motion.div className="stats-section" variants={cardVariants}>
        <div className="section-header">
          <FaCoins className="section-icon" />
          <h3>Token Leaderboard Performance</h3>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.tokens.balance}</div>
            <div className="stat-label">Current Balance</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.tokens.rank}</div>
            <div className="stat-label">Rank</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.tokens.netProfit}</div>
            <div className="stat-label">Net Profit</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.tokens.wagered}</div>
            <div className="stat-label">Tokens Wagered</div>
          </div>
        </div>
        
        {/* Record */}
        <div className="record-section">
          <div className="record-card wins">
            <div className="record-value">{stats.tokens.wins}</div>
            <div className="record-label">Wins</div>
          </div>
          <div className="record-card losses">
            <div className="record-value">{stats.tokens.losses}</div>
            <div className="record-label">Losses</div>
          </div>
          <div className="record-card games">
            <div className="record-value">{stats.tokens.gamesPlayed}</div>
            <div className="record-label">Games</div>
          </div>
          <div className="record-card winrate">
            <div className="record-value">
              {stats.tokens.gamesPlayed > 0 
                ? Math.round((stats.tokens.wins / stats.tokens.gamesPlayed) * 100)
                : 0}%
            </div>
            <div className="record-label">Win Rate</div>
          </div>
        </div>
      </motion.div>

      {/* Sweepstakes Stats */}
      <motion.div className="stats-section" variants={cardVariants}>
        <div className="section-header">
          <FaChessKnight className="section-icon" />
          <h3>Sweepstakes Leaderboard Performance</h3>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.sweepstakes.balance}</div>
            <div className="stat-label">Current Balance</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.sweepstakes.rank}</div>
            <div className="stat-label">Rank</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.sweepstakes.netProfit}</div>
            <div className="stat-label">Net Profit</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.sweepstakes.wagered}</div>
            <div className="stat-label">Sweepstakes Wagered</div>
          </div>
        </div>
        
        {/* Record */}
        <div className="record-section">
          <div className="record-card wins">
            <div className="record-value">{stats.sweepstakes.wins}</div>
            <div className="record-label">Wins</div>
          </div>
          <div className="record-card losses">
            <div className="record-value">{stats.sweepstakes.losses}</div>
            <div className="record-label">Losses</div>
          </div>
          <div className="record-card games">
            <div className="record-value">{stats.sweepstakes.gamesPlayed}</div>
            <div className="record-label">Games</div>
          </div>
          <div className="record-card winrate">
            <div className="record-value">
              {stats.sweepstakes.gamesPlayed > 0 
                ? Math.round((stats.sweepstakes.wins / stats.sweepstakes.gamesPlayed) * 100)
                : 0}%
            </div>
            <div className="record-label">Win Rate</div>
          </div>
        </div>
      </motion.div>

      {/* Only show rewards section if there are rewards */}
      {(stats.rewards.tokens > 0 || 
        stats.rewards.sweepstakes > 0 || 
        stats.achievements.length > 0) && (
        <motion.div className="rewards-section" variants={cardVariants}>
          <div className="section-header">
            <FaTrophy className="section-icon" />
            <h3>Season Rewards & Achievements</h3>
          </div>
          <div className="rewards-grid">
            {stats.rewards.tokens > 0 && (
              <div className="reward-card">
                <FaCoins className="reward-icon" />
                <div className="reward-info">
                  <div className="reward-value">{stats.rewards.tokens}</div>
                  <div className="reward-label">Tokens Earned</div>
                </div>
              </div>
            )}
            {stats.rewards.sweepstakes > 0 && (
              <div className="reward-card">
                <FaChessKnight className="reward-icon" />
                <div className="reward-info">
                  <div className="reward-value">{stats.rewards.sweepstakes}</div>
                  <div className="reward-label">Sweepstakes Earned</div>
                </div>
              </div>
            )}
          </div>
          
          {stats.achievements.length > 0 && (
            <div className="achievements-list">
              <h4>Achievements</h4>
              <ul>
                {stats.achievements.map((achievement, index) => (
                  <li key={index} className="achievement-item">
                    {achievement === 'first_place' && <span className="achievement-name">First Place Trophy</span>}
                    {achievement === 'second_place' && <span className="achievement-name">Second Place Medal</span>}
                    {achievement === 'third_place' && <span className="achievement-name">Third Place Medal</span>}
                    {achievement === 'most_games' && <span className="achievement-name">Most Active Player</span>}
                    {achievement === 'highest_win_rate' && <span className="achievement-name">Highest Win Rate</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default UserSeasonStats;
