// src/features/leaderboard/pages/Leaderboard.js

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaTrophy, FaMedal, FaStar, FaChess, FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp, FaCoins } from "react-icons/fa";
import { useAuth } from '../../auth/contexts/AuthContext';
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
  },
  {
    id: "user6",
    username: "EndgameExpert",
    avatar: null,
    rating: 2315,
    winPercentage: 64.2,
    games: 329,
    rank: 6,
    country: "CN",
    tokens: 6240,
    joinDate: "2023-10-12"
  },
  {
    id: "user7",
    username: "CheckMateCreator",
    avatar: null,
    rating: 2285,
    winPercentage: 62.8,
    games: 275,
    rank: 7,
    country: "ES",
    tokens: 5980,
    joinDate: "2023-12-05"
  },
  {
    id: "user8",
    username: "BishopBaron",
    avatar: null,
    rating: 2264,
    winPercentage: 61.1,
    games: 318,
    rank: 8,
    country: "IT",
    tokens: 5750,
    joinDate: "2023-09-28"
  },
  {
    id: "user9",
    username: "RookRuler",
    avatar: null,
    rating: 2231,
    winPercentage: 59.8,
    games: 290,
    rank: 9,
    country: "BR",
    tokens: 5430,
    joinDate: "2023-11-02"
  },
  {
    id: "user10",
    username: "ChessChampion99",
    avatar: null,
    rating: 2210,
    winPercentage: 58.4,
    games: 305,
    rank: 10,
    country: "CA",
    tokens: 5120,
    joinDate: "2023-10-15"
  }
];

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFrame, setTimeFrame] = useState("all");
  const [sortField, setSortField] = useState("rank");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filter, setFilter] = useState("all");
  const { token } = useAuth();

  // Flag to toggle between mock data and real data
  const useMockData = true; // Set to false for real API calls

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (useMockData) {
        // Simulate network delay
        setTimeout(() => {
          let filteredData = [...mockData];
          
          // Apply filters based on UI selections
          if (searchTerm) {
            filteredData = filteredData.filter(user => 
              user.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          
          if (filter !== "all") {
            // Additional filters could be implemented here
            // For example, filtering by country, win percentage threshold, etc.
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
          setLoading(false);
        }, 800); // Simulate loading delay
        return;
      }

      try {
        // Real API call would go here
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/leaderboard?timeFrame=${timeFrame}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }

        const data = await response.json();
        setLeaderboardData(data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        // Fallback to mock data on error
        setLeaderboardData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
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

  // Animation variants for Framer Motion
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

  const childVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 12 }
    }
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <h1 className="leaderboard-title">Global Leaderboard</h1>
        <div className="leaderboard-loading">
          <div className="leaderboard-spinner"></div>
          <p>Loading leaderboard data...</p>
        </div>
      </div>
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
    >
      <motion.h1 
        className="leaderboard-title"
        variants={childVariants}
      >
        Global Leaderboard
      </motion.h1>

      <motion.div 
        className="leaderboard-controls"
        variants={childVariants}
      >
        <div className="search-container">
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <FaSearch className="search-icon" />

        </div>

        <div className="filter-container">
          <div className="filter-dropdown">
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
          </div>

          <div className="time-dropdown">
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
          </div>
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
              {leaderboardData.map((player, index) => (
                <motion.tr 
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 100,
                    damping: 10
                  }}
                  whileHover={{ 
                    backgroundColor: "rgba(33, 150, 243, 0.1)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <td className="rank-cell">
                    <div className={getRankClass(player.rank)}>
                      {getRankIcon(player.rank)}
                    </div>
                  </td>
                  <td className="player-cell">
                    <div className="player-info">
                      <div className="player-avatar">
                        {player.avatar ? (
                          <img src={player.avatar} alt={`${player.username}'s avatar`} />
                        ) : (
                          <div className="avatar-placeholder">{player.username.charAt(0)}</div>
                        )}
                      </div>
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
                      <span className="rating-value">{player.rating}</span>
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
                      <div 
                        className="progress-bar" 
                        style={{ width: `${player.winPercentage}%` }}
                      ></div>
                      <span className="progress-text">{player.winPercentage.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="games-cell">{player.games}</td>
                  <td className="tokens-cell">
                    <div className="tokens-wrapper">
                      <span className="tokens-value">{player.tokens.toLocaleString()}</span>
                      <FaCoins className="tokens-icon" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Leaderboard;