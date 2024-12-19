
// frontend/src/components/Admin/Transfer.js
import React, { useState } from "react";

const Transfer = () => {
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleTransfer = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login as admin first.");
        return;
      }

      const payload = {
        fromAddress,
        toAddress,
        amount,
      };

      const response = await fetch("/tokens/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success! Transaction Hash: ${data.txHash}`);
        setFromAddress("");
        setToAddress("");
        setAmount("");
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error transferring tokens:", error);
      setMessage("An unexpected error occurred.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Admin Transfer Tokens</h2>
      <input
        type="text"
        placeholder="From Address"
        value={fromAddress}
        onChange={(e) => setFromAddress(e.target.value)}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="To Address"
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
      <button onClick={handleTransfer} style={styles.button}>
        Transfer Tokens
      </button>
      {message && <p>{message}</p>}
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
    backgroundColor: "#ffc107",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Transfer;
