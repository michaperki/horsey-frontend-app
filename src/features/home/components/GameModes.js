// src/features/home/components/GameModes.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChessKnight, FaChessKing, FaCoins } from 'react-icons/fa';
import { useLichess } from '../../auth/contexts/LichessContext';
import './GameModes.css';

const GameModes = ({ openPlaceBetModal }) => {
  const { lichessConnected, triggerShake } = useLichess();
  const navigate = useNavigate();

  const handleGameModeClick = (variant) => {
    if (!lichessConnected) {
      triggerShake();
      // Optionally show a notification here.
      return;
    }
    openPlaceBetModal(variant);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="game-modes-container">
      <motion.h2 
        className="game-modes-title"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        Game Modes
      </motion.h2>

      <motion.div 
        className="game-modes-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
      >
        <motion.div 
          className="game-mode-card"
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGameModeClick('standard')}
        >
          <div className="game-mode-icon">
            <FaChessKnight />
          </div>
          <div className="game-mode-content">
            <h3>Classic Blitz</h3>
            <p>Our most popular game mode!</p>
          </div>
        </motion.div>

        <motion.div 
          className="game-mode-card"
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGameModeClick('chess960')}
        >
          <div className="game-mode-icon">
            <FaChessKing />
          </div>
          <div className="game-mode-content">
            <h3>Chess 960</h3>
            <p>Pieces start on random squares!</p>
          </div>
        </motion.div>

        <motion.div 
          className="game-mode-card"
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGameModeClick(null)}
        >
          <div className="game-mode-icon">
            <FaCoins />
          </div>
          <div className="game-mode-content">
            <h3>Play for Horsey Coins</h3>
            <button
              className="btn btn-primary mt-2"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/store');
              }}
            >
              Get Coins
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameModes;