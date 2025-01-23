
// src/components/PlaceBet.js

import React, { useState, useEffect } from "react";
import { placeBet, getUserBalance } from "../services/api";
import "./PlaceBet.css"; // Import the CSS file

const PlaceBet = () => {
  const [colorPreference, setColorPreference] = useState("random");
  const [timeControl, setTimeControl] = useState("5|3");
  const [variant, setVariant] = useState("standard");
  const [amount, setAmount] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    // Fetch user balance on mount using the API service function
    const fetchBalance = async () => {
      try {
        const balance = await getUserBalance();
        setUserBalance(balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setMessage(error.message || "An unexpected error occurred while fetching your balance.");
      }
    };

    fetchBalance();
  }, []);

  const handlePlaceBet = async () => {
    setMessage("");
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
      const betData = {
        colorPreference,
        amount: Number(amount),
        timeControl,
        variant,
      };
      await placeBet(betData); // Corrected function call
      setModalMessage("Bet placed successfully!");
      setIsModalOpen(true);
      setUserBalance((prev) => prev - Number(amount));

      // Reset inputs
      setColorPreference("random");
      setTimeControl("5|3");
      setVariant("standard");
      setAmount("");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(`Error: ${error.response.data.error}`);
      } else {
        setMessage(error.message || "Failed to place the bet.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
  };

  return (
    <div>
      {/* Button to Open Place Bet Modal */}
      <button className="place-bet-open-button" onClick={() => setIsModalOpen(true)}>
        Place a Bet
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="place-bet-overlay">
          <div className="place-bet-modal">
            <button onClick={handleCloseModal} className="place-bet-close-button">&times;</button>
            {/* If modalMessage is set, show success message; otherwise, show the form */}
            {modalMessage ? (
              <div>
                <h2>Success</h2>
                <p>{modalMessage}</p>
                {/* Optionally, add a link to the game if available */}
                {/* <a href={gameLink} target="_blank" rel="noopener noreferrer">Go to Game</a> */}
                <button onClick={handleCloseModal} className="place-bet-modal-button">Close</button>
              </div>
            ) : (
              <div className="place-bet-container">
                <h2>Place a Bet</h2>
                <p>Your Balance: {userBalance} PTK</p>

                <label htmlFor="colorPreference">Color Preference:</label>
                <select
                  id="colorPreference"
                  value={colorPreference}
                  onChange={(e) => setColorPreference(e.target.value)}
                  className="place-bet-select"
                >
                  <option value="white">White</option>
                  <option value="black">Black</option>
                  <option value="random">Random</option>
                </select>

                <label htmlFor="timeControl">Time Control (minutes|increment):</label>
                <select
                  id="timeControl"
                  value={timeControl}
                  onChange={(e) => setTimeControl(e.target.value)}
                  className="place-bet-select"
                >
                  <option value="3|2">3|2</option>
                  <option value="5|3">5|3</option>
                  <option value="10|0">10|0</option>
                  <option value="15|10">15|10</option>
                  {/* Add more as needed */}
                </select>

                <label htmlFor="variant">Variant:</label>
                <select
                  id="variant"
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  className="place-bet-select"
                >
                  <option value="standard">Standard</option>
                  <option value="crazyhouse">Crazyhouse</option>
                  <option value="chess960">Chess 960</option>
                  {/* Add others if desired */}
                </select>

                <label htmlFor="amount">Bet Amount:</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="place-bet-input"
                  min="1"
                />

                <button
                  onClick={handlePlaceBet}
                  className="place-bet-button"
                  disabled={loading || !amount}
                >
                  {loading ? "Placing Bet..." : "Place Bet"}
                </button>

                {message && <p className="place-bet-message">{message}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceBet;

