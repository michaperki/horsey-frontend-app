// Updated src/features/betting/components/AvailableBets.js

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { acceptBet, getAvailableBets } from "../services/api";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useToken } from "../../token/contexts/TokenContext";
import { useSelectedToken } from '../../token/contexts/SelectedTokenContext';
import { formatDistanceToNow } from "date-fns";

// Import React Icons
import { 
  FaSignInAlt, 
  FaInfoCircle,
  FaExclamationCircle,
  FaSortUp,
  FaSortDown,
  FaSort,
  FaSpinner
} from 'react-icons/fa';

import "./AvailableBets.css";

const AvailableBets = ({ format = "1v1" }) => {
  const { token } = useAuth();
  const { tokenBalance, sweepstakesBalance, loading: tokenLoading, error: tokenError } = useToken();
  const { selectedToken } = useSelectedToken();
  
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Fetch available bets
  const fetchAvailableBets = useCallback(async () => {
    if (!token) {
      setError("Please log in to view available bets.");
      setLoading(false);
      return;
    }
    
    if (tokenLoading) {
      return;
    }
    
    if (tokenError) {
      setError("Failed to load your balances. Please try again.");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const fetchedBets = await getAvailableBets(selectedToken);

      // Filter bets based on user's balance
      const filteredBets = fetchedBets.filter((bet) => {
        if (bet.currencyType === "token") {
          return bet.wager <= tokenBalance;
        } else if (bet.currencyType === "sweepstakes") {
          return bet.wager <= sweepstakesBalance;
        }
        return false;
      });

      // Sort the filtered bets
      const sortedBets = [...filteredBets].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });

      setBets(sortedBets);
    } catch (err) {
      setError(err.message || "An error occurred while fetching available bets.");
    } finally {
      setLoading(false);
    }
  }, [token, tokenBalance, sweepstakesBalance, tokenLoading, tokenError, selectedToken, sortConfig]);

  // Setup polling for bets
  useEffect(() => {
    fetchAvailableBets();
    const intervalId = setInterval(fetchAvailableBets, 30000); // refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [fetchAvailableBets]);

  /**
   * Determines the opponent's color based on the bet's color preference.
   */
  const determineOpponentColor = (colorPreference) => {
    if (colorPreference === "white") return "black";
    if (colorPreference === "black") return "white";
    // If 'random', randomly assign 'white' or 'black'
    return Math.random() < 0.5 ? "white" : "black";
  };

  /**
   * Retrieves the appropriate rating based on the variant and available data.
   */
  const getRating = (bet) => {
    const { variant, creatorRatings } = bet;
    if (!creatorRatings) return "unrated";

    if (variant.toLowerCase() === "standard") {
      return creatorRatings.standard?.blitz || "unrated";
    } else {
      return creatorRatings.variants?.[variant.toLowerCase()] || "unrated";
    }
  };

  /**
   * Handles sorting when a column header is clicked
   */
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  /**
   * Renders the appropriate sort indicator based on current sort config
   */
  const renderSortIndicator = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="sort-indicator" />;
    }
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="sort-indicator" /> : 
      <FaSortDown className="sort-indicator" />;
  };

  /**
   * Renders the appropriate icon based on the color preference.
   */
  const renderColorIcon = (colorPreference) => {
    switch (colorPreference.toLowerCase()) {
      case "white":
        return <div className="color-indicator color-white"></div>;
      case "black":
        return <div className="color-indicator color-black"></div>;
      case "random":
      default:
        return <div className="color-indicator color-random"></div>;
    }
  };

  /**
   * Handle accepting a bet
   */
  const handleAcceptBet = async (betId, colorPreference) => {
    if (!token) {
      setError("Please log in to accept bets.");
      return;
    }
    setActionLoading((prev) => ({ ...prev, [betId]: true }));
    try {
      const opponentColor = determineOpponentColor(colorPreference);
      await acceptBet(betId, opponentColor);
      setBets((prev) => prev.filter((bet) => bet.id !== betId));
    } catch (err) {
      setError(err.message || "Failed to accept the bet.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [betId]: false }));
    }
  };

  // Rendering logic based on state
  if (loading) {
    return (
      <div className="bets-loading">
        <div className="spinner"></div>
        <p>Loading available bets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bets-error">
        <FaExclamationCircle />
        <p>{error}</p>
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div className="empty-bets">
        <FaInfoCircle className="empty-bets-icon" />
        <p className="empty-bets-message">No bets are available right now.</p>
        <p>Be the first to create a bet and challenge others!</p>
      </div>
    );
  }

  // Animation variants
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05 
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="bets-table-container">
      <motion.table 
        className="bets-table"
        variants={tableVariants}
        initial="hidden"
        animate="visible"
      >
        <thead>
          <tr>
            <th onClick={() => handleSort('creatorLichessUsername')}>
              Player {renderSortIndicator('creatorLichessUsername')}
            </th>
            <th onClick={() => handleSort('rating')}>
              Rating {renderSortIndicator('rating')}
            </th>
            <th>Color</th>
            <th onClick={() => handleSort('wager')}>
              Wager {renderSortIndicator('wager')}
            </th>
            <th>Time</th>
            <th onClick={() => handleSort('variant')}>
              Variant {renderSortIndicator('variant')}
            </th>
            <th onClick={() => handleSort('createdAt')}>
              Age {renderSortIndicator('createdAt')}
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {bets.map((bet) => {
              const {
                id,
                creatorLichessUsername,
                creator,
                colorPreference,
                timeControl,
                variant,
                wager,
                currencyType,
                createdAt,
              } = bet;

              return (
                <motion.tr 
                  key={id} 
                  data-bet-id={id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <td>{creatorLichessUsername || creator}</td>
                  <td className="rating-cell">{getRating(bet)}</td>
                  <td>{renderColorIcon(colorPreference)}</td>
                  <td>{wager} {currencyType.toUpperCase()}</td>
                  <td>{formatTimeControl(timeControl)}</td>
                  <td>{capitalizeFirstLetter(variant)}</td>
                  <td>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</td>
                  <td>
                    <button
                      onClick={() => handleAcceptBet(id, colorPreference)}
                      className={`join-button ${actionLoading[id] ? "loading" : ""}`}
                      disabled={actionLoading[id]}
                    >
                      {actionLoading[id] ? (
                        <>
                          <div className="spinner"></div>
                          Joining...
                        </>
                      ) : (
                        <>
                          <FaSignInAlt className="join-icon" /> Join
                        </>
                      )}
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </motion.table>
    </div>
  );
};

/**
 * Utility function to capitalize the first letter of a string.
 */
const capitalizeFirstLetter = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Formats the time control string into a more readable format.
 */
const formatTimeControl = (timeControl) => {
  if (!timeControl) return "N/A";
  const [minutes, increment] = timeControl.split("|");
  return `${minutes}+${increment}`;
};

export default AvailableBets;