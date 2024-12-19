
// frontend/src/components/Admin/Balance.js
import React, { useState } from "react";

const Balance = () => {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [message, setMessage] = useState("");

  const handleCheckBalance = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login as admin first.");
        return;
      }

      const response = await fetch(`/tokens/balance/${address}`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setBalance(data.balance);
        setMessage("");
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setMessage("An unexpected error occurred.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Check Token Balance</h2>
      <input
        type="text"
        placeholder="Wallet Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        style={styles.input}
      />
      <button onClick={handleCheckBalance} style={styles.button}>
        Check Balance
      </button>
      {balance !== null && <p>Balance: {balance} PTK</p>}
      {message && <p>{message}</p>}
    </div>
  );
};

// Simple inline styles
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
    backgroundColor: "#17a2b8",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Balance;
