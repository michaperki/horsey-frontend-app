// src/features/betting/components/PlaceBetModal.js

import React, { useState, useEffect } from "react";
import { placeBet } from "../services/api";
import { useToken } from "../../token/contexts/TokenContext";
import "./PlaceBetModal.css";
import PropTypes from "prop-types";

// Importing React Icons
import { FaCoins, FaGift, FaChess, FaChessKnight, FaRandom } from "react-icons/fa";
import { GiRabbit, GiTurtle } from "react-icons/gi";
import { MdColorLens } from "react-icons/md";

const PlaceBetModal = ({ isOpen, onClose, preSelectedVariant = "standard" }) => {
  const [currencyType, setCurrencyType] = useState("token");
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

  // Define maximum bet amount based on current balance or a predefined limit
  const maxBet = currentBalance || 1000; // Adjust 1000 as needed

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

      // Reset form fields
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

  // Handler for slider change
  const handleSliderChange = (e) => {
    setAmount(e.target.value);
  };

  // Handler for input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only numbers
    if (/^\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <div className="place-bet-overlay" onClick={handleCloseModal}>
      <div
        className="place-bet-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-bet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleCloseModal}
          className="place-bet-close-button"
          aria-label="Close Modal"
        >
          &times;
        </button>
        {modalMessage ? (
          <div className="place-bet-success">
            <h2 id="place-bet-title">Success</h2>
            <p>{modalMessage}</p>
            <button onClick={handleCloseModal} className="place-bet-modal-button">
              Close
            </button>
          </div>
        ) : (
          <div className="place-bet-container">
            <h2 id="place-bet-title">Place a Bet</h2>
            <p className="place-bet-balance">
              Your Balance: {currentBalance} {currencyType === "sweepstakes" ? "Sweepstakes" : "Tokens"}
            </p>

            {/* Currency Toggle using Radio Buttons as Tiles */}
            <div className="place-bet-form-group">
              <label>Currency:</label>
              <div className="place-bet-tile-group">
                {/* Token Option */}
                <label className={`place-bet-tile ${currencyType === "token" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="currency"
                    value="token"
                    checked={currencyType === "token"}
                    onChange={() => setCurrencyType("token")}
                  />
                  <FaCoins className="toggle-icon" />
                  Tokens
                </label>
                {/* Sweepstakes Option */}
                <label className={`place-bet-tile ${currencyType === "sweepstakes" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="currency"
                    value="sweepstakes"
                    checked={currencyType === "sweepstakes"}
                    onChange={() => setCurrencyType("sweepstakes")}
                  />
                  <FaGift className="toggle-icon" />
                  Sweepstakes
                </label>
              </div>
            </div>

            {/* Color Preference Toggle using Radio Buttons as Tiles */}
            <div className="place-bet-form-group">
              <label>Color Preference:</label>
              <div className="place-bet-tile-group">
                {/* White Option */}
                <label className={`place-bet-tile ${colorPreference === "white" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="colorPreference"
                    value="white"
                    checked={colorPreference === "white"}
                    onChange={() => setColorPreference("white")}
                  />
                  <MdColorLens className="toggle-icon white-icon" />
                  White
                </label>
                {/* Black Option */}
                <label className={`place-bet-tile ${colorPreference === "black" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="colorPreference"
                    value="black"
                    checked={colorPreference === "black"}
                    onChange={() => setColorPreference("black")}
                  />
                  <MdColorLens className="toggle-icon black-icon" />
                  Black
                </label>
                {/* Random Option */}
                <label className={`place-bet-tile ${colorPreference === "random" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="colorPreference"
                    value="random"
                    checked={colorPreference === "random"}
                    onChange={() => setColorPreference("random")}
                  />
                  <FaRandom className="toggle-icon" />
                  Random
                </label>
              </div>
            </div>

            {/* Time Control Toggle using Radio Buttons as Tiles */}
            <div className="place-bet-form-group">
              <label>Time Control:</label>
              <div className="place-bet-tile-group">
                {["3|2", "5|3", "10|0", "15|10"].map((control) => (
                  <label
                    key={control}
                    className={`place-bet-tile ${timeControl === control ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="timeControl"
                      value={control}
                      checked={timeControl === control}
                      onChange={() => setTimeControl(control)}
                    />
                    {["3|2", "5|3"].includes(control) ? (
                      <GiRabbit className="toggle-icon" />
                    ) : (
                      <GiTurtle className="toggle-icon" />
                    )}
                    {control}
                  </label>
                ))}
              </div>
            </div>

            {/* Variant Toggle using Radio Buttons as Tiles */}
            <div className="place-bet-form-group">
              <label>Variant:</label>
              <div className="place-bet-tile-group">
                <label className={`place-bet-tile ${variant === "standard" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="variant"
                    value="standard"
                    checked={variant === "standard"}
                    onChange={() => setVariant("standard")}
                  />
                  <FaChess className="toggle-icon" />
                  Standard
                </label>
                <label className={`place-bet-tile ${variant === "crazyhouse" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="variant"
                    value="crazyhouse"
                    checked={variant === "crazyhouse"}
                    onChange={() => setVariant("crazyhouse")}
                  />
                  <FaChessKnight className="toggle-icon" />
                  Crazyhouse
                </label>
                <label className={`place-bet-tile ${variant === "chess960" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="variant"
                    value="chess960"
                    checked={variant === "chess960"}
                    onChange={() => setVariant("chess960")}
                  />
                  <FaChess className="toggle-icon" />
                  Chess960
                </label>
              </div>
            </div>

            {/* Bet Amount Input and Slider */}
            <div className="place-bet-form-group">
              <label htmlFor="amount">Bet Amount:</label>
              <div className="bet-amount-input-container">
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={handleInputChange}
                  className="place-bet-input"
                  min="1"
                  max={maxBet}
                  placeholder="Enter amount"
                />
                <input
                  type="range"
                  min="1"
                  max={maxBet}
                  value={amount}
                  onChange={handleSliderChange}
                  className="place-bet-slider"
                />
                <div className="bet-amount-display">
                  <span>Amount:</span>
                  <span
                    className="bet-amount-value"
                    onClick={() => {
                      // Focus the input field when the display is clicked
                      document.getElementById("amount").focus();
                    }}
                  >
                    {amount || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePlaceBet}
              className="place-bet-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Placing Bet...
                </>
              ) : (
                "Place Bet"
              )}
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
