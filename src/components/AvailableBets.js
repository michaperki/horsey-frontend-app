// src/components/AvailableBets.js
import React, { useEffect, useState } from "react";
import { acceptBet } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const AvailableBets = () => {
  const { token } = useAuth();
  const [bets, setBets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Optional filters
  const [status, setStatus] = useState("pending");
  const [minWager, setMinWager] = useState("");
  const [maxWager, setMaxWager] = useState("");

  useEffect(() => {
    fetchAvailableBets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAvailableBets = async () => {
    if (!token) {
      setError("Please log in to view available bets.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");

    // Build query if needed
    const params = {
      status, // e.g., "pending"
      minWager,
      maxWager,
    };

    // Remove empty
    Object.keys(params).forEach((k) => {
      if (!params[k]) delete params[k];
    });

    const queryString = new URLSearchParams(params).toString();

    try {
      const response = await fetch(`/bets/seekers?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch available bets.");
      }
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected data format from server.");
      }

      // Filter out duplicate IDs and exclude bets without an ID
      const uniqueBets = [];
      const seenIds = new Set();
      for (let bet of data) {
        if (bet.id && !seenIds.has(bet.id)) {
          uniqueBets.push(bet);
          seenIds.add(bet.id);
        }
      }

      setBets(uniqueBets);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBet = async (betId) => {
    setError("");
    setSuccessMessage("");
    if (!token) {
      setError("Please log in to accept bets.");
      return;
    }

    try {
      const result = await acceptBet(token, betId);
      setSuccessMessage("Successfully accepted the bet!");
      // Optionally remove the bet from local state
      setBets((prev) => prev.filter((b) => b.id !== betId));

      // Open Lichess link in a new tab if provided
      if (result.gameLink) {
        window.open(result.gameLink, "_blank");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApplyFilter = () => {
    // Re-fetch with new parameters
    fetchAvailableBets();
  };

  return (
    <div style={styles.container}>
      <h2>Available Bets</h2>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <label>Status:</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="matched">Matched</option>
          {/* Add others if the backend supports it */}
        </select>

        <label>Min Wager:</label>
        <input
          type="number"
          value={minWager}
          onChange={(e) => setMinWager(e.target.value)}
          style={{ width: 80 }}
        />

        <label>Max Wager:</label>
        <input
          type="number"
          value={maxWager}
          onChange={(e) => setMaxWager(e.target.value)}
          style={{ width: 80 }}
        />

        <button onClick={handleApplyFilter}>Apply Filters</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      {bets.length === 0 && !loading && !error && (
        <p>No bets available right now.</p>
      )}

      {bets.length > 0 && !loading && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Bet ID</th>
              <th>Creator</th>
              <th>Creator Balance</th>
              <th>Wager</th>
              <th>Game Type</th>
              <th>Color</th>
              <th>Created</th>
              <th>Accept</th>
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
                <td>{bet.colorPreference}</td>
                <td data-testid={`created-at-${bet.id}`}>
                  {bet.createdAt
                    ? new Date(bet.createdAt).toLocaleString('en-US', {
                        // Specify locale and options to ensure consistency
                        timeZone: 'UTC', // Adjust if needed
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : 'N/A'}
                </td>
                <td>
                  <button
                    onClick={() => handleAcceptBet(bet.id)}
                    style={styles.acceptBtn}
                    data-testid={`accept-bet-${bet.id}`}
                  >
                    Accept
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
  container: { padding: 20 },
  filterBar: {
    marginBottom: 20,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 10,
  },
  acceptBtn: {
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "5px 8px",
    cursor: "pointer",
  },
};

export default AvailableBets;
