
// src/components/AvailableBets.js

import React, { useEffect, useState, useCallback } from "react";
import { acceptBet, getAvailableBets } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const AvailableBets = ({ format }) => {
  const { token } = useAuth();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAvailableBets = useCallback(async () => {
    if (!token) {
      setError("Please log in to view available bets.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Modify the API call to include the format if needed
      const fetchedBets = await getAvailableBets(format);
      setBets(fetchedBets);
    } catch (err) {
      setError(err.message || "An error occurred while fetching available bets.");
    } finally {
      setLoading(false);
    }
  }, [token, format]);

  useEffect(() => {
    fetchAvailableBets();
  }, [fetchAvailableBets, format]);

  const handleAcceptBet = async (betId, opponentColor) => {
    if (!token) {
      setError("Please log in to accept bets.");
      return;
    }
    try {
      await acceptBet(betId, opponentColor); // Removed 'updatedBet'
      setBets((prev) => prev.filter((bet) => bet.id !== betId));
    } catch (err) {
      setError(err.message || "Failed to accept the bet.");
    }
  };

  return (
    <div style={styles.container}>
      {loading && <p>Loading available bets...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {bets.length === 0 && !loading && !error && (
        <p>No bets available right now.</p>
      )}

      {bets.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Seeker</th>
              <th>Rating</th>
              <th>Color</th>
              <th>Time Control</th>
              <th>Variant</th>
              <th>Wager</th>
              <th>Players</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet) => (
              <tr key={bet.id}>
                <td>{bet.creator}</td>
                <td>{bet.averageRating || "N/A"}</td>
                <td>{bet.colorPreference}</td>
                <td>{bet.timeControl}</td>
                <td>{bet.variant}</td>
                <td>{bet.wager}</td>
                <td>{bet.players}</td>
                <td>
                  {/* Assuming opponentColor is determined here; adjust as needed */}
                  <button
                    onClick={() => handleAcceptBet(bet.id, "white")} // Example opponentColor
                    style={styles.acceptBtn}
                  >
                    Join
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f9f9f9",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    backgroundColor: "#fff",
    textAlign: "left",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  acceptBtn: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "5px 10px",
    cursor: "pointer",
  },
};

export default AvailableBets;

