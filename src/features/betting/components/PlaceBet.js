// Enhanced PlaceBet.js with improved styling and animations
import React, { useState } from "react";
import { useLichess } from '../../auth/contexts/LichessContext';
import { createNotification } from '../../notifications/services/api';
import './PlaceBet.css';
import { FaDice, FaCoins, FaChessKnight, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const PlaceBet = ({ onOpenModal }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const { lichessConnected, triggerShake, loading } = useLichess();

  const handleOpenModal = async () => {
    if (!lichessConnected) {
      triggerShake();
      // Create notification about connecting Lichess account
      try {
        await createNotification({
          message: 'Please connect your Lichess account before placing a bet.',
          type: 'warning',
        });
      } catch (error) {
        console.error("Failed to create notification:", error);
      }
      return;
    }
    
    // If connected, open the modal
    onOpenModal();
  };

  const buttonVariants = {
    idle: { 
      scale: 1,
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
    },
    hover: { 
      scale: 1.05, 
      boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)"
    },
    pressed: { 
      scale: 0.95,
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)"
    }
  };

  const iconVariants = {
    idle: { rotate: 0 },
    hover: { rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }
  };

  return (
    <AnimatePresence>
      <motion.button 
        className="place-bet-button"
        onClick={handleOpenModal}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        disabled={loading}
        variants={buttonVariants}
        initial="idle"
        animate={isPressed ? "pressed" : isHovered ? "hover" : "idle"}
        whileHover="hover"
        whileTap="pressed"
      >
        <motion.div 
          className="place-bet-icon-container"
          variants={iconVariants}
          animate={isHovered ? "hover" : "idle"}
        >
          {loading ? (
            <FaSpinner className="place-bet-spinner" />
          ) : (
            <FaDice className="place-bet-icon" />
          )}
        </motion.div>
        <div className="place-bet-text">
          <span className="place-bet-primary-text">Place a Bet</span>
          <span className="place-bet-secondary-text">Challenge players for tokens</span>
        </div>
        <FaCoins className="place-bet-coins-icon" />
      </motion.button>
    </AnimatePresence>
  );
};

export default PlaceBet;