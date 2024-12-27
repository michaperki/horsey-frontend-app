
// src/components/AvailableBets.js

import React, { useEffect, useState } from "react";

const AvailableBets = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptingBetId, setAcceptingBetId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedColors, setSelectedColors] = useState({}); // Track selected colors per bet

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

        console.log("Fetch response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.log("Error data:", errorData);
          setError(errorData.error || "Failed to fetch available bets.");
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Fetched available bets data:", JSON.stringify(data, null, 2));

        // Ensure data is an array and each bet has a unique id
        if (Array.isArray(data)) {
          const uniqueBets = data.filter((bet, index, self) =>
            bet.id && self.findIndex((b) => b.id === bet.id) === index
          );

          if (uniqueBets.length !== data.length) {
            console.warn("Duplicate or missing id found in fetched bets.");
          }

          setBets(uniqueBets);
        } else {
          console.warn("Received data is not an array:", data);
          setBets([]); // Default to empty array
          setError("Unexpected data format received from server.");
        }
      } catch (err) {
        console.error("Error fetching available bets:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableBets();
  }, []);

  const handleColorChange = (betId, color) => {
    setSelectedColors((prev) => ({ ...prev, [betId]: color }));
  };

  const handleAcceptBet = async (betId) => {
    const opponentColor = selectedColors[betId] || "random"; // Default to 'random' if not selected
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

      const response = await fetch(`/bets/accept/${betId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ opponentColor }),
      });

      console.log("Accept bet response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Accept bet error data:", errorData);
        setError(errorData.error || "Failed to accept the bet.");
        setAcceptingBetId(null);
        return;
      }

      const data = await response.json();
      console.log("Accept bet success data:", data);
      setSuccessMessage("Successfully joined the bet!");
      // Optionally, remove the accepted bet from the list
      setBets((prevBets) => prevBets.filter((bet) => bet.id !== betId));
    } catch (err) {
      console.error("Error accepting bet:", err);
      setError("An unexpected error occurred.");
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
              <th>Created At</th>
              <th>Choose Color</th>
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
                <td>{new Date(bet.createdAt).toLocaleString()}</td>
                <td>
                  <select
                    data-testid={`color-select-${bet.id}`} // Added data-testid
                    value={selectedColors[bet.id] || "random"}
                    onChange={(e) => handleColorChange(bet.id, e.target.value)}
                    style={styles.select}
                  >
                    <option value="white">White</option>
                    <option value="black">Black</option>
                    <option value="random">Random</option>
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => handleAcceptBet(bet.id)}
                    disabled={acceptingBetId === bet.id}
                    style={styles.button}
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
  select: {
    padding: "5px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
};

export default AvailableBets;

