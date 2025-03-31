// src/features/leaderboard/pages/Leaderboard.js - Updated to use SeasonContext
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaTrophy, 
  FaMedal, 
  FaChess, 
  FaSearch, 
  FaFilter, 
  FaSortAmountDown, 
  FaSortAmountUp, 
  FaCoins,
  FaCalendarAlt
} from "react-icons/fa";
import { useAuth } from '../../auth/contexts/AuthContext';
import { ApiError } from "../../common/components/ApiError";
import { useSeason } from '../../seasons/contexts/SeasonContext';
import SeasonBanner from '../components/SeasonBanner';
import './Leaderboard.css';

const Leaderboard = () => {
  const { token } = useAuth();
  const { 
    activeSeason, 
    seasonLeaderboard,
    loading: seasonLoading,
    error: seasonError,
    fetchActiveSeason,
    fetchSeasonLeaderboard
  } = useSeason();

  const [searchTerm, setSearchTerm] = useState("");
  const [timeFrame, setTimeFrame] = useState("all");
  const [sortField, setSortField] = useState("rank");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filter, setFilter] = useState("all");
  const [currencyType, setCurrencyType] = useState(token);

  // Get leaderboard data based on currencyType
  const leaderboardData = seasonLeaderboard[currencyType] || [];

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field is clicked
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" 
      ? <FaSortAmountUp className="sort-icon" /> 
      : <FaSortAmountDown className="sort-icon" />;
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
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const childVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
      opacity: 1, 
      y: 0,
      transition: { 
        delay: custom * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }),
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  if (seasonLoading) {
    return (
      <motion.div 
        className="leaderboard-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.h1 
          className="leaderboard-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {timeFrame === 'season' ? 'Season Leaderboard' : 'Global Leaderboard'}
        </motion.h1>
        <motion.div 
          className="leaderboard-loading"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 70 }}
        >
          <div className="leaderboard-spinner"></div>
          <p>Loading leaderboard data...</p>
        </motion.div>
      </motion.div>
    );
  }

  const getRankClass = (rank) => {
    if (rank === 1) return "rank rank-gold";
    if (rank === 2) return "rank rank-silver";
    if (rank === 3) return "rank rank-bronze";
    return "rank";
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaTrophy className="rank-icon gold" />;
    if (rank === 2) return <FaMedal className="rank-icon silver" />;
    if (rank === 3) return <FaMedal className="rank-icon bronze" />;
    return <span className="rank-number">{rank}</span>;
  };

  const getLeaderboardTitle = () => {
    if (timeFrame === 'season') {
      return activeSeason ? `Season ${activeSeason.season.seasonNumber} Leaderboard` : 'Season Leaderboard';
    } else {
      return 'Global Leaderboard';
    }
  };

  // Function to format balance value based on currency type
  const formatBalance = (balance) => {
    return balance?.toLocaleString() || '0';
  };

  return (
    <motion.div 
      className="leaderboard-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.h1 
        className="leaderboard-title"
        variants={childVariants}
      >
        {getLeaderboardTitle()}
      </motion.h1>

      {/* Season Banner */}
      {activeSeason && (
        <SeasonBanner 
          season={activeSeason.season} 
          rewards={activeSeason.rewards} 
          metadata={activeSeason.metadata}
          isActive={timeFrame === 'season'}
        />
      )}

      {/* Display any errors */}
      {seasonError && (
        <div className="leaderboard-error-container">
          <ApiError 
            error={seasonError} 
            onDismiss={() => fetchActiveSeason()} // This will reset the error state
            onRetry={() => fetchSeasonLeaderboard(currencyType)}
          />
        </div>
      )}

      <motion.div 
        className="leaderboard-controls"
        variants={childVariants}
      >
        <div className="search-container">
          <motion.input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            initial={{ opacity: 0, width: "80%" }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ delay: 0.3, duration: 0.3 }}
          />
          <FaSearch className="search-icon" />
        </div>

        <div className="filter-container">
          <motion.div 
            className="filter-dropdown"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <FaCoins className="filter-icon" />
            <select 
              value={currencyType} 
              onChange={(e) => setCurrencyType(e.target.value)}
              className="filter-select"
            >
              <option value="token">Tokens</option>
              <option value="sweepstakes">Sweepstakes</option>
            </select>
          </motion.div>

          <motion.div 
            className="time-dropdown"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <FaCalendarAlt className="time-icon" />
            <select 
              value={timeFrame} 
              onChange={(e) => setTimeFrame(e.target.value)}
              className="time-select"
            >
              <option value="all">All Time</option>
              <option value="season">Current Season</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
              <option value="day">Today</option>
            </select>
          </motion.div>

          <motion.div 
            className="filter-dropdown"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <FaFilter className="filter-icon" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Players</option>
              <option value="friends">Friends Only</option>
              <option value="country">My Country</option>
            </select>
          </motion.div>
        </div>
      </motion.div>

      {leaderboardData.length === 0 ? (
        <motion.div 
          className="leaderboard-empty"
          variants={childVariants}
        >
          <FaChess className="empty-icon" />
          <p>No players found matching your criteria</p>
          <button 
            onClick={() => {
              setSearchTerm("");
              setFilter("all");
              setTimeFrame("all");
            }}
            className="reset-button"
          >
            Reset Filters
          </button>
        </motion.div>
      ) : (
        <motion.div 
          className="leaderboard-table-container"
          variants={childVariants}
        >
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="rank-column">Rank</th>
                <th className="player-column">Player</th>
                <th 
                  className="rating-column clickable"
                  onClick={() => handleSort("rating")}
                >
                  Rating {renderSortIcon("rating")}
                </th>
                <th 
                  className="win-column clickable"
                  onClick={() => handleSort("winPercentage")}
                >
                  Win % {renderSortIcon("winPercentage")}
                </th>
                <th 
                  className="games-column clickable"
                  onClick={() => handleSort("games")}
                >
                  Games {renderSortIcon("games")}
                </th>
                <th 
                  className="tokens-column clickable"
                  onClick={() => handleSort("balance")}
                >
                  {currencyType === 'token' ? 'Tokens' : 'Sweepstakes'} {renderSortIcon("balance")}
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {leaderboardData.map((player, index) => (
                  <motion.tr 
                    key={player.id || index}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{ 
                      backgroundColor: "rgba(33, 150, 243, 0.1)",
                      transition: { duration: 0.2 }
                    }}
                    layoutId={`player-${player.id || index}`}
                  >
                    <td className="rank-cell">
                      <motion.div 
                        className={getRankClass(index + 1)}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      >
                        {getRankIcon(index + 1)}
                      </motion.div>
                    </td>
                    <td className="player-cell">
                      <div className="player-info">
                        <motion.div 
                          className="player-avatar"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          {player.avatar ? (
                            <img src={player.avatar} alt={`${player.username}'s avatar`} />
                          ) : (
                            <div className="avatar-placeholder">{player.username.charAt(0)}</div>
                          )}
                        </motion.div>
                        <div className="player-details">
                          <span className="player-name">{player.username}</span>
                          {player.country && (
                            <span className="player-country">{player.country}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="rating-cell">
                      <div className="rating-wrapper">
                        <motion.span 
                          className="rating-value"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.3 }}
                        >
                          {player.rating || 'N/A'}
                        </motion.span>
                        {player.ratingChange > 0 && (
                          <span className="rating-change positive">+{player.ratingChange}</span>
                        )}
                        {player.ratingChange < 0 && (
                          <span className="rating-change negative">{player.ratingChange}</span>
                        )}
                      </div>
                    </td>
                    <td className="win-cell">
                      <div className="progress-container">
                        <motion.div 
                          className="progress-bar" 
                          initial={{ width: 0 }}
                          animate={{ width: `${player.winPercentage || 0}%` }}
                          transition={{ delay: index * 0.05 + 0.4, duration: 0.8, ease: "easeOut" }}
                        ></motion.div>
                        <span className="progress-text">{(player.winPercentage || 0).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="games-cell">{player.games || 0}</td>
                    <td className="tokens-cell">
                      <motion.div 
                        className="tokens-wrapper"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="tokens-value">{formatBalance(player.balance)}</span>
                        <motion.div
                          animate={{ rotateY: [0, 360] }}
                          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        >
                          <FaCoins className="tokens-icon" />
                        </motion.div>
                      </motion.div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Leaderboard;
