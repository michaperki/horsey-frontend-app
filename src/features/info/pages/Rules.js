// src/features/info/pages/Rules.js

import React from 'react';
import { motion } from 'framer-motion';
import { FaChessKnight, FaUserFriends, FaGamepad, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import './InfoPages.css'; // We'll create a shared CSS file for all info pages

const RulesPage = () => {
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <motion.div 
      className="info-page-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div className="info-page-header" variants={itemVariants}>
        <div className="info-page-icon">
          <FaChessKnight />
        </div>
        <h1>Game Rules</h1>
      </motion.div>

      <motion.div className="info-page-content" variants={itemVariants}>
        <p className="info-page-intro">
          Welcome to the Rules Page! Our platform is designed to provide a fun, fair, and engaging experience for all players. 
          To ensure this environment, we've established the following rules and guidelines.
        </p>

        <motion.div className="info-card" variants={itemVariants}>
          <div className="info-card-header">
            <FaUserFriends className="info-card-icon" />
            <h2>Player Conduct</h2>
          </div>
          <ul className="info-list">
            <li>Treat all players with respect and courtesy</li>
            <li>No harassment, offensive language, or inappropriate behavior</li>
            <li>No cheating or exploiting game mechanics</li>
            <li>Do not abandon games in progress</li>
            <li>Keep communication within the platform respectful and constructive</li>
          </ul>
        </motion.div>

        <motion.div className="info-card" variants={itemVariants}>
          <div className="info-card-header">
            <FaGamepad className="info-card-icon" />
            <h2>Gameplay Guidelines</h2>
          </div>
          <ul className="info-list">
            <li>Complete all games once started</li>
            <li>Use of chess engines or outside assistance is strictly prohibited</li>
            <li>Suspiciously perfect play may be flagged for review</li>
            <li>Intentional stalling or time-wasting is not permitted</li>
            <li>Multiple accounts per user are not allowed</li>
          </ul>
        </motion.div>

        <motion.div className="info-card" variants={itemVariants}>
          <div className="info-card-header">
            <FaExclamationTriangle className="info-card-icon" />
            <h2>Penalties</h2>
          </div>
          <ul className="info-list">
            <li>Violations may result in warnings, temporary suspension, or permanent bans</li>
            <li>Cheating will result in immediate account suspension and forfeiture of tokens</li>
            <li>Abandoned games may result in rating penalties and token losses</li>
            <li>Repeated violations will lead to escalating penalties</li>
          </ul>
        </motion.div>

        <motion.div className="info-card" variants={itemVariants}>
          <div className="info-card-header">
            <FaShieldAlt className="info-card-icon" />
            <h2>Reporting & Support</h2>
          </div>
          <ul className="info-list">
            <li>Report suspicious behavior via the in-game reporting system</li>
            <li>Contact support for assistance with rule interpretation</li>
            <li>All reports are thoroughly investigated by our team</li>
            <li>False reports may result in penalties for the reporter</li>
          </ul>
        </motion.div>

        <motion.div className="info-page-footer" variants={itemVariants}>
          <p>These rules are subject to change. Last updated: March 15, 2025</p>
          <p>The Horsey Team reserves the right to modify these rules at any time to ensure fair play and a positive community atmosphere.</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default RulesPage;