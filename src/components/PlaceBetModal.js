
// src/components/PlaceBetModal.js

import React, { useState, useEffect } from "react";
import { placeBet } from "../services/api";
import { useToken } from "../contexts/TokenContext";
import "./PlaceBet.css";
import PropTypes from "prop-types";

const PlaceBetModal = ({ isOpen, onClose, preSelectedVariant = "standard" }) => {
  const [currencyType, setCurrencyType] = useState("token"); // 'token' or 'sweepstakes'
  const [colorPreference, setColorPreference] = useState("random");
  const [timeControl, setTimeControl] = useState("5|3");
  const [variant, setVariant] = useState(preSelectedVariant || "standard");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalMessage, setModalMessage] = useState("");

  const {
    tokenBalance,
    sweepstakesBalance,
    updateTokenBalance,
    updateSweepstakesBalance,
  } = useToken();

  const currentBalance =
    currencyType === "sweepstakes" ? sweepstakesBalance : tokenBalance;

  useEffect(() => {
    if (isOpen && preSelectedVariant) {
      setVariant(preSelectedVariant);
    }
  }, [isOpen, preSelectedVariant]);

  const handlePlaceBet = async () => {
    setMessage("");
    if (!amount || Number(amount) <= 0) {
      setMessage("Please enter a valid bet amount.");
      return;
    }
    if (Number(amount) > currentBalance) {
      setMessage("Insufficient balance.");
      return;
    }

    setLoading(true);
    try {
      const betData = {
        currencyType,
        amount: Number(amount),
        colorPreference,
        timeControl,
        variant,
      };
      await placeBet(betData);
      setModalMessage("Bet placed successfully!");
      if (currencyType === "sweepstakes") {
        updateSweepstakesBalance(sweepstakesBalance - Number(amount));
      } else {
        updateTokenBalance(tokenBalance - Number(amount));
      }

      setCurrencyType("token");
      setColorPreference("random");
      setTimeControl("5|3");
      setVariant("standard");
      setAmount("");
    } catch (err) {
      console.error("Error placing bet:", err);
      if (err.response?.data?.error) {
        setMessage(`Error: ${err.response.data.error}`);
      } else {
        setMessage(err.message || "Failed to place bet.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalMessage("");
    setMessage("");
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="place-bet-overlay" onClick={handleCloseModal}>
      <div
        className="place-bet-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleCloseModal} className="place-bet-close-button" aria-label="Close Modal">
          &times;
        </button>
        {modalMessage ? (
          <div>
            <h2>Success</h2>
            <p>{modalMessage}</p>
            <button onClick={handleCloseModal} className="place-bet-modal-button">
              Close
            </button>
          </div>
        ) : (
          <div className="place-bet-container">
            <h2>Place a Bet</h2>
            <p>
              Your Balance: {currentBalance}{" "}
              {currencyType === "sweepstakes" ? "Sweepstakes" : "Tokens"}
            </p>

            <label htmlFor="currencyType">Currency:</label>
            <select
              id="currencyType"
              value={currencyType}
              onChange={(e) => setCurrencyType(e.target.value)}
              className="place-bet-select"
            >
              <option value="token">Token</option>
              <option value="sweepstakes">Sweepstakes</option>
            </select>

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
              disabled={loading}
            >
              {loading ? "Placing Bet..." : "Place Bet"}
            </button>

            {message && <p className="place-bet-message">{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

PlaceBetModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  preSelectedVariant: PropTypes.string,
};

export default PlaceBetModal;

