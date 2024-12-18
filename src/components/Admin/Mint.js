// frontend/src/components/Admin/Mint.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Mint = () => {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleMint = async () => {
    try {
      // Retrieve JWT token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login as admin first.");
        return;
      }

      // Prepare the request payload
      const payload = {
        toAddress,
        amount,
      };

      // Make the POST request to the backend
      const response = await fetch("/tokens/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token, // Send JWT token in headers
        },
        body: JSON.stringify(payload),
      });

      // Parse the JSON response
      const data = await response.json();

      if (response.ok) {
        setMessage(`Success! Transaction Hash: ${data.txHash}`);
        // Optionally, reset the form
        setToAddress("");
        setAmount("");
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error minting tokens:", error);
      setMessage("An unexpected error occurred.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Admin Mint Tokens</h2>
      <input
        type="text"
        placeholder="Recipient Address"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        style={styles.input}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={styles.input}
      />
      <button onClick={handleMint} style={styles.button}>
        Mint Tokens
      </button>
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
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Mint;
