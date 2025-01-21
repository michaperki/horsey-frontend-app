
// src/components/PlaceBet.js

import React, { useState, useEffect } from "react";
import { placeBet } from "../services/api";

const PlaceBet = () => {
  const [colorPreference, setColorPreference] = useState("random");
  const [timeControl, setTimeControl] = useState("5|3");
  const [variant, setVariant] = useState("standard");
  const [amount, setAmount] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch user balance on mount
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
    setMessage("");
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please log in to place a bet.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setMessage("Please enter a valid bet amount.");
      return;
    }
    if (Number(amount) > userBalance) {
      setMessage("Insufficient balance to place the bet.");
      return;
    }

    setLoading(true);
    try {
      setMessage("Bet placed successfully!");
      setUserBalance((prev) => prev - Number(amount));

      // Reset inputs
      setColorPreference("random");
      setTimeControl("5|3");
      setVariant("standard");
      setAmount("");
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

      <label>Color Preference:</label>
      <select
        value={colorPreference}
        onChange={(e) => setColorPreference(e.target.value)}
        style={styles.input}
      >
        <option value="white">White</option>
        <option value="black">Black</option>
        <option value="random">Random</option>
      </select>

      <label>Time Control (minutes|increment):</label>
      <select
        value={timeControl}
        onChange={(e) => setTimeControl(e.target.value)}
        style={styles.input}
      >
        <option value="3|2">3|2</option>
        <option value="5|3">5|3</option>
        <option value="10|0">10|0</option>
        <option value="15|10">15|10</option>
        {/* Add more as needed */}
      </select>

      <label>Variant:</label>
      <select
        value={variant}
        onChange={(e) => setVariant(e.target.value)}
        style={styles.input}
      >
        <option value="standard">Standard</option>
        <option value="crazyhouse">Crazyhouse</option>
        <option value="chess960">Chess 960</option>
        {/* Add others if desired */}
      </select>

      <label>Bet Amount:</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={styles.input}
      />

      <button
        onClick={handlePlaceBet}
        style={styles.button}
        disabled={loading || !amount}
      >
        {loading ? "Placing Bet..." : "Place Bet"}
      </button>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "400px",
    margin: "auto",
    border: "1px solid #ccc",
    borderRadius: "8px",
    marginTop: "50px",
    backgroundColor: "#f9f9f9",
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

