// Enhanced PlaceBetModal.js

import React, { useState, useEffect } from "react";
import { placeBet } from "../services/api";
import { useToken } from "../../token/contexts/TokenContext";
import { useSelectedToken } from "../../token/contexts/SelectedTokenContext";
import PropTypes from "prop-types";
import "./PlaceBetModal.css";

// Import React Icons
import { 
  FaCoins, 
  FaChess, 
  FaChessKnight, 
  FaChessRook,
  FaRandom, 
  FaTimes,
  FaCheckCircle,
  FaChessPawn
} from "react-icons/fa";
import { GiRabbit, GiTurtle } from "react-icons/gi";

const PlaceBetModal = ({ isOpen, onClose, preSelectedVariant = "standard" }) => {
  // State variables
  const [colorPreference, setColorPreference] = useState("random");
  const [timeControl, setTimeControl] = useState("5|3");
  const [variant, setVariant] = useState(preSelectedVariant || "standard");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Context hooks
  const {
    tokenBalance,
    sweepstakesBalance,
    updateTokenBalance,
    updateSweepstakesBalance,
  } = useToken();
  
  const { selectedToken } = useSelectedToken();

  // Current balance based on selected token from context
  const currentBalance = selectedToken === "sweepstakes" ? sweepstakesBalance : tokenBalance;
  
  // Maximum bet amount based on balance
  const maxBet = currentBalance || 1000;

  // Effect to set variant when modal is opened
  useEffect(() => {
    if (isOpen && preSelectedVariant) {
      setVariant(preSelectedVariant);
    }
  }, [isOpen, preSelectedVariant]);

  // Handle bet placement
  const handlePlaceBet = async () => {
    setMessage("");
    
    // Validate amount
    if (!amount || Number(amount) <= 0) {
      setMessage("Please enter a valid bet amount.");
      return;
    }
    
    // Validate balance
    if (Number(amount) > currentBalance) {
      setMessage("You don't have enough " + (selectedToken === "sweepstakes" ? "sweepstakes tokens" : "tokens") + " for this bet.");
      return;
    }

    setLoading(true);
    try {
      const betData = {
        currencyType: selectedToken,
        amount: Number(amount),
        colorPreference,
        timeControl,
        variant,
      };
      
      await placeBet(betData);
      
      // Update balances
      if (selectedToken === "sweepstakes") {
        updateSweepstakesBalance(sweepstakesBalance - Number(amount));
      } else {
        updateTokenBalance(tokenBalance - Number(amount));
      }

      // Show success state
      setSuccessMessage(`Your bet of ${amount} ${selectedToken === "token" ? "Tokens" : "Sweepstakes Tokens"} has been placed successfully! An opponent will be matched soon.`);
      setSuccess(true);

    } catch (err) {
      console.error("Error placing bet:", err);
      if (err.response?.data?.error) {
        setMessage(`Error: ${err.response.data.error}`);
      } else {
        setMessage(err.message || "Failed to place bet. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Close modal and reset state
  const handleCloseModal = () => {
    setSuccess(false);
    setMessage("");
    onClose();
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only numbers
    if (/^\d*$/.test(value)) {
      setAmount(value);
    }
  };

  // Quick bet amount presets
  const getBetPresets = () => {
    const presets = [];
    if (currentBalance >= 10) presets.push(10);
    if (currentBalance >= 25) presets.push(25);
    if (currentBalance >= 50) presets.push(50);
    if (currentBalance >= 100) presets.push(100);
    if (currentBalance >= 250) presets.push(250);
    if (currentBalance >= 500) presets.push(500);
    
    // Always include All-in option
    if (currentBalance > 0) {
      presets.push("All-in");
    }
    
    return presets;
  };

  // Apply a preset amount
  const applyPreset = (preset) => {
    if (preset === "All-in") {
      setAmount(currentBalance.toString());
    } else {
      setAmount(preset.toString());
    }
  };

  if (!isOpen) {
    return null;
  }

  // Render success message screen
  if (success) {
    return (
      <div className="place-bet-overlay" onClick={handleCloseModal}>
        <div
          className="place-bet-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          style={{animation: 'zoomIn 0.25s ease-out'}}
        >
          <button
            onClick={handleCloseModal}
            className="place-bet-close-button"
            aria-label="Close Modal"
          >
            <FaTimes />
          </button>
          
          <div className="place-bet-success">
            <div className="place-bet-success-icon">
              <FaCheckCircle />
            </div>
            <h2>Bet Placed!</h2>
            <p>{successMessage}</p>
            <button 
              onClick={handleCloseModal} 
              className="place-bet-success-button"
            >
              Return to Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render main bet form
  return (
    <div className="place-bet-overlay" onClick={handleCloseModal}>
      <div
        className="place-bet-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-bet-title"
        style={{animation: 'zoomIn 0.25s ease-out'}}
      >
        <button
          onClick={handleCloseModal}
          className="place-bet-close-button"
          aria-label="Close Modal"
        >
          <FaTimes />
        </button>

        <h2 id="place-bet-title" className="place-bet-title">Place a Bet</h2>
        
        <div className="place-bet-balance">
          Your Balance: <span>{currentBalance}</span> {selectedToken === "sweepstakes" ? "Sweepstakes Tokens" : "Tokens"}
        </div>

        {/* Color Preference */}
        <div className="place-bet-section">
          <label className="place-bet-section-label">Color Preference:</label>
          <div className="place-bet-options">
            <div 
              className={`place-bet-option color-option white-option ${colorPreference === "white" ? "selected" : ""}`}
              onClick={() => setColorPreference("white")}
            >
              <FaChessPawn className="place-bet-option-icon" />
              <span className="place-bet-option-text">White</span>
            </div>
            <div 
              className={`place-bet-option color-option black-option ${colorPreference === "black" ? "selected" : ""}`}
              onClick={() => setColorPreference("black")}
            >
              <FaChessPawn className="place-bet-option-icon" />
              <span className="place-bet-option-text">Black</span>
            </div>
            <div 
              className={`place-bet-option color-option random-option ${colorPreference === "random" ? "selected" : ""}`}
              onClick={() => setColorPreference("random")}
            >
              <FaRandom className="place-bet-option-icon" />
              <span className="place-bet-option-text">Random</span>
            </div>
          </div>
        </div>

        {/* Time Control */}
        <div className="place-bet-section">
          <label className="place-bet-section-label">Time Control:</label>
          <div className="place-bet-options">
            <div 
              className={`place-bet-option time-control-option fast ${timeControl === "3|2" ? "selected" : ""}`}
              onClick={() => setTimeControl("3|2")}
            >
              <GiRabbit className="place-bet-option-icon" />
              <span className="place-bet-option-text">3|2</span>
            </div>
            <div 
              className={`place-bet-option time-control-option fast ${timeControl === "5|3" ? "selected" : ""}`}
              onClick={() => setTimeControl("5|3")}
            >
              <GiRabbit className="place-bet-option-icon" />
              <span className="place-bet-option-text">5|3</span>
            </div>
            <div 
              className={`place-bet-option time-control-option slow ${timeControl === "10|0" ? "selected" : ""}`}
              onClick={() => setTimeControl("10|0")}
            >
              <GiTurtle className="place-bet-option-icon" />
              <span className="place-bet-option-text">10|0</span>
            </div>
            <div 
              className={`place-bet-option time-control-option slow ${timeControl === "15|10" ? "selected" : ""}`}
              onClick={() => setTimeControl("15|10")}
            >
              <GiTurtle className="place-bet-option-icon" />
              <span className="place-bet-option-text">15|10</span>
            </div>
          </div>
        </div>

        {/* Game Variant */}
        <div className="place-bet-section">
          <label className="place-bet-section-label">Game Variant:</label>
          <div className="place-bet-options">
            <div 
              className={`place-bet-option variant-option ${variant === "standard" ? "selected" : ""}`}
              onClick={() => setVariant("standard")}
            >
              <FaChess className="place-bet-option-icon" />
              <span className="place-bet-option-text">Standard</span>
            </div>
            <div 
              className={`place-bet-option variant-option ${variant === "crazyhouse" ? "selected" : ""}`}
              onClick={() => setVariant("crazyhouse")}
            >
              <FaChessKnight className="place-bet-option-icon" />
              <span className="place-bet-option-text">Crazyhouse</span>
            </div>
            <div 
              className={`place-bet-option variant-option ${variant === "chess960" ? "selected" : ""}`}
              onClick={() => setVariant("chess960")}
            >
              <FaChessRook className="place-bet-option-icon" />
              <span className="place-bet-option-text">Chess960</span>
            </div>
          </div>
        </div>

        {/* Bet Amount */}
        <div className="place-bet-amount-section">
          <label className="place-bet-section-label">Bet Amount:</label>
          
          {/* Quick bet presets */}
          <div className="bet-presets">
            {getBetPresets().map((preset) => (
              <div 
                key={preset} 
                className="bet-preset-button"
                onClick={() => applyPreset(preset)}
              >
                {preset}
              </div>
            ))}
          </div>
          
          {/* Amount input field */}
          <div className="place-bet-input-wrapper">
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={handleInputChange}
              className="place-bet-input"
              placeholder="Enter amount"
              aria-label="Bet amount"
              min="1"
              max={maxBet}
            />
            <span className="place-bet-currency-indicator">
              {selectedToken === "token" ? "PTK" : "SWP"}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {message && <div className="place-bet-error">{message}</div>}

        {/* Submit Button */}
        <button
          onClick={handlePlaceBet}
          className={`place-bet-submit ${loading ? "loading" : ""}`}
          disabled={loading || !amount || Number(amount) <= 0 || Number(amount) > currentBalance}
        >
          {loading ? (
            <>
              <span className="spinner"></span> Processing...
            </>
          ) : (
            "Place Bet"
          )}
        </button>
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