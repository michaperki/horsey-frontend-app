// src/features/lobby/pages/Lobby.js - Updated to work with fixed CSS

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AvailableBets from "../../betting/components/AvailableBets";
import { useLichess } from '../../auth/contexts/LichessContext';
import { useProfile } from '../../profile/contexts/ProfileContext';
import { FaTrophy, FaChessKnight, FaDice, FaInfoCircle } from 'react-icons/fa';

// Import the enhanced styling
import './Lobby.css';

const Lobby = () => {
  const { lichessConnected, lichessUsername } = useLichess();
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState("1v1");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Animation variants - matching Home page style
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const tabVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  // Set initial load to false after the first render
  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  const handleTabClick = (tab) => {
    if (tab !== "1v1") return; // Only allow 1v1 tab for now
    setActiveTab(tab);
  };

  return (
    <motion.div 
      className="lobby-container"
      variants={containerVariants}
      initial={isInitialLoad ? "hidden" : false}
      animate="visible"
    >
      <motion.div 
        className="welcome-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2>Welcome back, {lichessUsername || profile.username || 'Player'}!</h2>
        <div className="user-stats">
          <div className="stat-item">
            <span className="stat-label">Karma:</span>
            <span className="stat-value">{profile.karma || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Membership:</span>
            <span className="stat-value">{profile.membership || 'Free'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Rating Class:</span>
            <span className="stat-value">{profile.ratingClass || 'Beginner'}</span>
          </div>
        </div>
      </motion.div>

      <div className="tab-navigation">
        <motion.button
          className={`tab-button ${activeTab === "1v1" ? 'active' : ''}`}
          onClick={() => handleTabClick("1v1")}
          variants={tabVariants}
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
        >
          <FaChessKnight className="tab-icon" /> 1v1 Matches
        </motion.button>
        
        <motion.button
          className="tab-button disabled"
          disabled={true}
          variants={tabVariants}
        >
          <FaDice className="tab-icon" /> Sit & Go
          <span className="coming-soon-badge">Soon</span>
        </motion.button>
        
        <motion.button
          className="tab-button disabled"
          disabled={true}
          variants={tabVariants}
        >
          <FaTrophy className="tab-icon" /> Tournaments
          <span className="coming-soon-badge">Soon</span>
        </motion.button>
      </div>
      
      {activeTab === "1v1" && (
        <motion.div
          className="tab-content"
          key="1v1"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Available Bets Title */}
          <h2 style={{
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '20px',
            color: '#ffc107',
            position: 'relative',
            paddingBottom: '10px',
          }}>
            Available Bets
            {/* Custom underline */}
            <span style={{
              content: '',
              position: 'absolute',
              left: '50%',
              bottom: 0,
              transform: 'translateX(-50%)',
              width: '60px',
              height: '3px',
              background: 'linear-gradient(90deg, #3993db, #ffc107)',
              borderRadius: '3px',
              display: 'block'
            }}></span>
          </h2>
          
          {/* AvailableBets component */}
          <AvailableBets format="1v1" />
        </motion.div>
      )}
      
      {activeTab === "sit-and-go" && (
        <motion.div
          className="feature-placeholder"
          key="sit-and-go"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="empty-bets">
            <FaInfoCircle className="empty-bets-icon" />
            <p className="empty-bets-message">
              Sit and Go tournaments are coming soon!
            </p>
            <p>Be the first to join a quick multi-player tournament format with exciting prizes.</p>
          </div>
        </motion.div>
      )}
      
      {activeTab === "tournament" && (
        <motion.div
          className="feature-placeholder"
          key="tournament"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="empty-bets">
            <FaInfoCircle className="empty-bets-icon" />
            <p className="empty-bets-message">
              Tournaments are coming soon!
            </p>
            <p>Compete against multiple players in scheduled tournaments with leaderboards and prizes.</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Lobby;