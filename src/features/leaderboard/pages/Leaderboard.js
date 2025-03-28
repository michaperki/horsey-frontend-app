// src/features/leaderboard/pages/Leaderboard.js - Updated with Error Handling

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrophy, FaMedal, FaChess, FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp, FaCoins } from "react-icons/fa";
import { useAuth } from '../../auth/contexts/AuthContext';
import { ApiError } from "../../common/components/ApiError";
import { useApiError } from "../../common/contexts/ApiErrorContext";
import './Leaderboard.css';

// Enhanced mockData with more realistic fields and values
const mockData = [
  {
    id: "user1",
    username: "GrandMaster42",
    avatar: null, // Using avatar placeholders instead of image files
    rating: 2543,
    winPercentage: 76.2,
    games: 345,
    rank: 1,
    country: "US",
    tokens: 12500,
    joinDate: "2023-08-15"
  },
  {
    id: "user2",
    username: "ChessWizard",
    avatar: null,
    rating: 2491,
    winPercentage: 72.8,
    games: 287,
    rank: 2,
    country: "RU",
    tokens: 9800,
    joinDate: "2023-09-12"
  },
  {
    id: "user3",
    username: "QueenMaster",
    avatar: null,
    rating: 2467,
    winPercentage: 71.5,
    games: 412,
    rank: 3,
    country: "DE",
    tokens: 8900,
    joinDate: "2023-07-25"
  },
  {
    id: "user4",
    username: "TacticalKnight",
    avatar: null,
    rating: 2390,
    winPercentage: 68.7,
    games: 298,
    rank: 4,
    country: "FR",
    tokens: 7650,
    joinDate: "2023-10-05"
  },
  {
    id: "user5",
    username: "PawnProdigy",
    avatar: null,
    rating: 2340,
    winPercentage: 65.4,
    games: 256,
    rank: 5,
    country: "IN",
    tokens: 6720,
    joinDate: "2023-11-18"
  }
];

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFrame, setTimeFrame] = useState("all");
  const [sortField, setSortField] = useState("rank");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filter, setFilter] = useState("all");
  const { token } = useAuth();
  const { handleApiError } = useApiError();

  // Flag to toggle between mock data and real data
  const useMockData = true; // Set to false for real API calls

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    if (useMockData) {
      // Simulate network delay
      setTimeout(() => {
        try {
          let filteredData = [...mockData];
          
          // Apply filters based on UI selections
          if (searchTerm) {
            filteredData = filteredData.filter(user => 
              user.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          
          if (filter !== "all") {
            // Additional filters could be implemented here
          }
          
          // Sort the data
          filteredData.sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];
            
            // String comparison for text fields
            if (typeof valA === 'string') {
              valA = valA.toLowerCase();
              valB = valB.toLowerCase();
            }
            
            if (sortDirection === "asc") {
              return valA > valB ? 1 : -1;
            } else {
              return valA < valB ? 1 : -1;
            }
          });
          
          setLeaderboardData(filteredData);
        } catch (err) {
          setError({
            code: 'DATA_ERROR',
            message: 'Error processing leaderboard data'
          });
        } finally {
          setLoading(false);
        }
      }, 800); // Simulate loading delay
      return;
    }

    try {
      // Real API call with error handling
      const getLeaderboardWithHandling = handleApiError(
        async () => {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/leaderboard?timeFrame=${timeFrame}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch leaderboard data");
          }

          return await response.json();
        },
        {
          showGlobalError: false,
          onError: (err) => setError(err)
        }
      );
      
      const data = await getLeaderboardWithHandling();
      setLeaderboardData(data);
    } catch (error) {
      // Error is handled by handleApiError
      // Fallback to mock data on error
      console.error("Error fetching leaderboard data:", error);
      setLeaderboardData(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, timeFrame, searchTerm, sortField, sortDirection, filter]);

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

  if (loading) {
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
          Global Leaderboard
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
        Global Leaderboard
      </motion.h1>

      {/* Display any errors */}
      {error && (
        <div className="leaderboard-error-container">
          <ApiError 
            error={error} 
            onDismiss={() => setError(null)}
            onRetry={fetchLeaderboard}
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

          <motion.div 
            className="time-dropdown"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <FaChess className="time-icon" />
            <select 
              value={timeFrame} 
              onChange={(e) => setTimeFrame(e.target.value)}
              className="time-select"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
              <option value="day">Today</option>
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
                  onClick={() => handleSort("tokens")}
                >
                  Tokens {renderSortIcon("tokens")}
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {leaderboardData.map((player, index) => (
                  <motion.tr 
                    key={player.id}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{ 
                      backgroundColor: "rgba(33, 150, 243, 0.1)",
                      transition: { duration: 0.2 }
                    }}
                    layoutId={`player-${player.id}`}
                  >
                    <td className="rank-cell">
                      <motion.div 
                        className={getRankClass(player.rank)}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      >
                        {getRankIcon(player.rank)}
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
                          {player.rating}
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
                          animate={{ width: `${player.winPercentage}%` }}
                          transition={{ delay: index * 0.05 + 0.4, duration: 0.8, ease: "easeOut" }}
                        ></motion.div>
                        <span className="progress-text">{player.winPercentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="games-cell">{player.games}</td>
                    <td className="tokens-cell">
                      <motion.div 
                        className="tokens-wrapper"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="tokens-value">{player.tokens.toLocaleString()}</span>
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
