
// src/components/PlaceBet.js

import React, { useState, useEffect } from "react";
import { placeBet } from "../services/api"; // Import the placeBet function
// import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const PlaceBet = () => {
  const [creatorColor, setCreatorColor] = useState("random"); // Default to 'random'
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchBalance = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please log in to view your balance.");
        return;
      }
      try {
        const response = await fetch("/tokens/balance/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setUserBalance(data.balance);
        } else {
          setMessage(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        setMessage("An unexpected error occurred while fetching your balance.");
      }
    };

    fetchBalance();
  }, []);

  const handlePlaceBet = async () => {
    if (!amount || Number(amount) <= 0) {
      setMessage("Please enter a valid bet amount.");
      return;
    }

    if (Number(amount) > userBalance) {
      setMessage("Insufficient balance to place the bet.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please log in to place a bet.");
      return;
    }

    setLoading(true);
    try {
      const newBet = await placeBet(token, { creatorColor, amount: Number(amount) });
      setMessage("Bet placed successfully!");

      // Redirect to the game link if available
      if (newBet.gameLink) {
        window.open(newBet.gameLink, "_blank"); // Opens the game link in a new tab
      }

      setCreatorColor("random");
      setAmount("");
      setUserBalance((prev) => prev - Number(amount));
    } catch (error) {
      setMessage(error.message || "Failed to place the bet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Place a Bet</h2>
      <p>Your Balance: {userBalance} PTK</p>
      {/* Removed Game ID input */}
      <select
        value={creatorColor}
        name="creatorColor"
        onChange={(e) => setCreatorColor(e.target.value)}
        style={styles.input}
      >
        <option value="white">White</option>
        <option value="black">Black</option>
        <option value="random">Random</option>
      </select>
      <input
        type="number"
        name="amount"
        placeholder="Amount to Bet"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={styles.input}
      />
      <button
        type="submit"
        onClick={handlePlaceBet}
        style={styles.button}
        disabled={loading || !amount || Number(amount) <= 0 || Number(amount) > userBalance}
      >
        {loading ? "Placing Bet..." : "Place Bet"}
      </button>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

// Inline Styles for Simplicity
const styles = {
  container: {
    padding: "20px",
    maxWidth: "400px",
    margin: "auto",
    border: "1px solid #ccc",
    borderRadius: "8px",
    marginTop: "50px",
    backgroundColor: "#f1f1f1",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  message: {
    marginTop: "10px",
    color: "red",
  },
};

export default PlaceBet;

