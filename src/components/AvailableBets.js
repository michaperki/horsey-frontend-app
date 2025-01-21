
// src/components/AvailableBets.js
import React, { useEffect, useState } from "react";
import { acceptBet } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const AvailableBets = ({ format }) => {
  const { token } = useAuth();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAvailableBets();
  }, [format]);

  const fetchAvailableBets = async () => {
    if (!token) {
      setError("Please log in to view available bets.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/bets/seekers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch available bets.");
      const data = await response.json();

      // data should look like: { seekers: [ { id, creator, averageRating, wager, ... }, ... ] }
      setBets(data.seekers || []);
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBet = async (betId) => {
    if (!token) {
      setError("Please log in to accept bets.");
      return;
    }
    try {
      await acceptBet(token, betId);
      setBets((prev) => prev.filter((bet) => bet.id !== betId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      {loading && <p>Loading...</p>}
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
                  <button
                    onClick={() => handleAcceptBet(bet.id)}
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

