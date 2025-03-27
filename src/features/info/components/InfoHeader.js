// src/features/info/components/InfoHeader.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChessKnight } from 'react-icons/fa';

const InfoHeader = ({ title, icon }) => {
  const navigate = useNavigate();
  
  // Animation variants
  const itemVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="info-header-container">
      <div className="info-navigation">
        <button 
          className="back-button" 
          onClick={() => navigate(-1)}
        >
          <FaChevronLeft /> Back
        </button>
        <div className="logo">
          <img src="/assets/logo.png" alt="App Logo" className="navbar__logo-image" />
          <span className="navbar__logo-text">Horsey</span>
        </div>
      </div>
      
      <motion.div className="info-page-header" variants={itemVariants}>
        <div className="info-page-icon">
          {icon || <FaChessKnight />}
        </div>
        <h1>{title}</h1>
      </motion.div>
    </div>
  );
};

export default InfoHeader;