
// frontend/src/components/Admin/ValidateResult.js
import React, { useState } from "react";

const ValidateResult = () => {
  const [gameId, setGameId] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const handleValidate = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login as admin first.");
        return;
      }

      const response = await fetch("/lichess/validate-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token, // Ensure your backend extracts token correctly
        },
        body: JSON.stringify({ gameId }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        setMessage("Game result processed successfully.");
      } else {
        setMessage(`Error: ${data.error}`);
        setResult(null);
      }
    } catch (error) {
      console.error("Error validating game result:", error);
      setMessage("An unexpected error occurred.");
      setResult(null);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Validate Lichess Game Result</h2>
      <input
        type="text"
        placeholder="Enter Lichess Game ID"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
        style={styles.input}
      />
      <button onClick={handleValidate} style={styles.button}>
        Validate Result
      </button>
      {message && <p>{message}</p>}
      {result && (
        <div style={styles.result}>
          <p><strong>Outcome:</strong> {result.outcome}</p>
          <p><strong>White Player:</strong> {result.whitePlayer}</p>
          <p><strong>Black Player:</strong> {result.blackPlayer}</p>
          <p><strong>Status:</strong> {result.status}</p>
          <p><strong>Message:</strong> {result.message}</p>
        </div>
      )}
    </div>
  );
};

// Simple inline styles
const styles = {
  container: {
    padding: "20px",
    maxWidth: "500px",
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
    backgroundColor: "#17a2b8",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  result: {
    marginTop: "20px",
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
};

export default ValidateResult;
