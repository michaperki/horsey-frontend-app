
import React, { useState, useEffect } from "react";

const PlaceBet = () => {
  const [gameId, setGameId] = useState("");
  const [creatorColor, setCreatorColor] = useState("white");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(false);

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
    if (!gameId || !amount || Number(amount) <= 0) {
      setMessage("Please enter a valid game ID and bet amount.");
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
      const response = await fetch("/bets/place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gameId, creatorColor, amount: Number(amount) }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Bet placed successfully!");
        setGameId("");
        setCreatorColor("white");
        setAmount("");
        setUserBalance((prev) => prev - Number(amount));
      } else {
        setMessage(data.error || "Failed to place the bet.");
      }
    } catch (error) {
      console.error("Error placing bet:", error);
      setMessage("An unexpected error occurred while placing the bet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Place a Bet</h2>
      <p>Your Balance: {userBalance} PTK</p>
      <input
        type="text"
        name="gameId"
        placeholder="Lichess Game ID"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
        style={styles.input}
      />
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
        disabled={loading || !gameId || Number(amount) <= 0 || Number(amount) > userBalance}
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

