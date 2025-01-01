
// src/components/AvailableBets.js

import React, { useEffect, useState } from "react";
import { acceptBet } from "../services/api"; // Import the acceptBet function

const AvailableBets = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptingBetId, setAcceptingBetId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchAvailableBets = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view available bets.");
          setLoading(false);
          return;
        }

        const response = await fetch("/bets/seekers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || "Failed to fetch available bets.");
          setLoading(false);
          return;
        }

        const data = await response.json();

        // **Handle Unexpected Data Format**
        if (!Array.isArray(data)) {
          setError("Unexpected data format received from server.");
          setBets([]);
          setLoading(false);
          return;
        }

        // **Filter Duplicate Bet IDs - Retain First Occurrence**
        const uniqueBetsMap = new Map();
        data.forEach((bet) => {
          if (bet.id && !uniqueBetsMap.has(bet.id)) {
            uniqueBetsMap.set(bet.id, bet);
          }
        });
        const uniqueBets = Array.from(uniqueBetsMap.values());
        setBets(uniqueBets);

        // **Optional: Notify if duplicates were found and ignored**
        if (data.length !== uniqueBets.length) {
          setError("Some duplicate bets were found and have been ignored.");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableBets();
  }, []);

  const handleAcceptBet = async (betId) => {
    setAcceptingBetId(betId);
    setError("");
    setSuccessMessage("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to accept bets.");
        setAcceptingBetId(null);
        return;
      }

      const data = await acceptBet(token, betId); // Modified to receive entire response
      setSuccessMessage("Successfully joined the bet!");

      // Optionally, remove the accepted bet from the list
      setBets((prevBets) => prevBets.filter((bet) => bet.id !== betId));

      // Open the game link in a new tab if available
      if (data.gameLink) {
        window.open(data.gameLink, "_blank");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setAcceptingBetId(null);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Available Bets</h2>

      {loading && <p>Loading available bets...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      {!loading && bets.length === 0 && <p>No available bets at the moment.</p>}

      {!loading && bets.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Bet ID</th>
              <th>Creator</th>
              <th>Balance</th>
              <th>Wager (PTK)</th>
              <th>Game Type</th>
              <th>Color</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet) => (
              <tr key={bet.id}>
                <td>{bet.id}</td>
                <td>{bet.creator}</td>
                <td>{bet.creatorBalance}</td>
                <td>{bet.wager}</td>
                <td>{bet.gameType}</td>
                <td>{bet.colorPreference || "N/A"}</td> {/* Handle undefined colorPreference */}
                <td data-testid={`created-at-${bet.id}`}>
                  {new Date(bet.createdAt).toLocaleString()}
                </td>
                <td>
                  <button
                    onClick={() => handleAcceptBet(bet.id)}
                    disabled={acceptingBetId === bet.id}
                    style={styles.button}
                    data-testid={`join-bet-${bet.id}`} // Added data-testid
                  >
                    {acceptingBetId === bet.id ? "Joining..." : "Join Bet"}
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

// Simple inline styles
const styles = {
  container: {
    padding: "20px",
    maxWidth: "1000px",
    margin: "auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    marginTop: "50px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  button: {
    padding: "5px 10px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default AvailableBets;

