
// src/components/AvailableBets.js

import React, { useEffect, useState, useCallback } from "react";
import { acceptBet, getAvailableBets } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "./AvailableBets.css";
import { format } from "timeago.js"; // Importing timeago.js for formatting time

// Import React Icons
import { 
  FaUser, 
  FaStar, 
  FaClock, 
  FaPuzzlePiece, 
  FaMoneyBill, 
  FaHourglassHalf, 
  FaSignInAlt, 
  FaChessPawn, 
  FaDice 
} from "react-icons/fa";

const AvailableBets = () => {
  const { token } = useAuth();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({}); // To handle loading state for individual bets

  const fetchAvailableBets = useCallback(async () => {
    if (!token) {
      setError("Please log in to view available bets.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const fetchedBets = await getAvailableBets();
      setBets(fetchedBets);
    } catch (err) {
      setError(err.message || "An error occurred while fetching available bets.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAvailableBets();
  }, [fetchAvailableBets]);

  /**
   * Determines the opponent's color based on the bet's color preference.
   * @param {string} colorPreference - The color preference of the seeker.
   * @returns {string} - The opponent's color.
   */
  const determineOpponentColor = (colorPreference) => {
    if (colorPreference === "white") return "black";
    if (colorPreference === "black") return "white";
    // If 'random', randomly assign 'white' or 'black'
    return Math.random() < 0.5 ? "white" : "black";
  };

  /**
   * Retrieves the appropriate rating based on the variant and available data.
   * @param {object} bet - The bet object.
   * @returns {number|string} - The rating or "unrated".
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
   * Renders the appropriate icon based on the color preference.
   * @param {string} colorPreference - The color preference of the bet.
   * @returns {JSX.Element} - The corresponding icon.
   */
  const renderColorIcon = (colorPreference) => {
    switch (colorPreference.toLowerCase()) {
      case "white":
        return <FaChessPawn color="white" aria-label="White Pawn" />;
      case "black":
        return <FaChessPawn color="black" aria-label="Black Pawn" />;
      case "random":
        return <FaDice color="#ffc107" aria-label="Random Color" />; // Golden color for dice
      default:
        return <FaDice color="#6c757d" aria-label="Unknown Color" />; // Fallback icon
    }
  };

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

  return (
    <div className="available-bets-container">
      <h2>Available Bets</h2>
      {loading && <p>Loading available bets...</p>}
      {error && <p className="error-message">{error}</p>}
      {bets.length === 0 && !loading && !error && (
        <p>No bets available right now.</p>
      )}

      {bets.length > 0 && (
        <div className="table-wrapper">
          <table className="available-bets-table">
            <thead>
              <tr>
                <th title="Seeker" className="header-icon">
                  <FaUser />
                </th>
                <th title="Rating" className="header-icon">
                  <FaStar />
                </th>
                <th title="Color" className="header-icon">
                  <FaChessPawn />
                </th>
                <th title="Time Control" className="header-icon">
                  <FaClock />
                </th>
                <th title="Variant" className="header-icon">
                  <FaPuzzlePiece />
                </th>
                <th title="Wager (PTK)" className="header-icon">
                  <FaMoneyBill />
                </th>
                <th title="Time Elapsed" className="header-icon">
                  <FaHourglassHalf />
                </th>
                <th title="Action" className="header-icon">
                  <FaSignInAlt />
                </th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => {
                const {
                  id,
                  creatorLichessUsername,
                  creator,
                  colorPreference,
                  timeControl,
                  variant,
                  wager,
                  createdAt,
                  // creatorRatings, // Removed
                } = bet;

                return (
                  <tr key={id}>
                    <td>{creatorLichessUsername || creator}</td>
                    <td>{getRating(bet)}</td>
                    <td>{renderColorIcon(colorPreference)}</td> {/* Updated Line */}
                    <td>{formatTimeControl(timeControl)}</td>
                    <td>{capitalizeFirstLetter(variant)}</td>
                    <td>{wager}</td>
                    <td>{format(createdAt)}</td>
                    <td>
                      <button
                        onClick={() => handleAcceptBet(id, colorPreference)}
                        className={`join-button ${actionLoading[id] ? "loading" : ""}`}
                        disabled={actionLoading[id]}
                        title="Join Bet"
                        aria-label="Join Bet"
                      >
                        {actionLoading[id] ? "Joining..." : <FaSignInAlt />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/**
 * Utility function to capitalize the first letter of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} - The capitalized string.
 */
const capitalizeFirstLetter = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Formats the time control string into a more readable format.
 * @param {string} timeControl - Time control in the format "minutes|increment".
 * @returns {string} - Formatted time control.
 */
const formatTimeControl = (timeControl) => {
  if (!timeControl) return "N/A";
  const [minutes, increment] = timeControl.split("|");
  return `${minutes}+${increment}`;
};

export default AvailableBets;

