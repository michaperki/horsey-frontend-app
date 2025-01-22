
// src/components/AvailableBets.js

import React, { useEffect, useState, useCallback } from "react";
import { acceptBet, getAvailableBets } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "./AvailableBets.css";
import { format } from "timeago.js"; // Importing timeago.js for formatting time

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
   * @returns {number|string} - The rating or "N/A".
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
                <th>Seeker</th>
                <th>Rating</th>
                <th>Color</th>
                <th>Time Control</th>
                <th>Variant</th>
                <th>Wager (PTK)</th>
                <th>Time Elapsed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => (
                <tr key={bet.id}>
                  <td>{bet.creatorLichessUsername || bet.creator}</td>
                  <td>{getRating(bet)}</td>
                  <td>{capitalizeFirstLetter(bet.colorPreference)}</td>
                  <td>{formatTimeControl(bet.timeControl)}</td>
                  <td>{capitalizeFirstLetter(bet.variant)}</td>
                  <td>{bet.wager}</td>
                  <td>{format(bet.createdAt)}</td>
                  <td>
                    <button
                      onClick={() => handleAcceptBet(bet.id, bet.colorPreference)}
                      className={`join-button ${
                        actionLoading[bet.id] ? "loading" : ""
                      }`}
                      disabled={actionLoading[bet.id]}
                    >
                      {actionLoading[bet.id] ? "Joining..." : "Join"}
                    </button>
                  </td>
                </tr>
              ))}
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

