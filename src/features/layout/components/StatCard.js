// src/features/layout/components/StatCard.js

import React from 'react';
import PropTypes from 'prop-types';
import { 
  FaGamepad, 
  FaCoins, 
  FaMoneyBillWave, 
  FaPercentage, 
  FaArrowUp, 
  FaArrowDown 
} from 'react-icons/fa';
import "./StatCard.css"

const StatCard = ({ title, value }) => {
  // Function to determine which icon to use based on the title
  const getIcon = () => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('game')) {
      return <FaGamepad className="stat-icon" />;
    } else if (titleLower.includes('wager')) {
      return <FaCoins className="stat-icon" />;
    } else if (titleLower.includes('roi') || titleLower.includes('percent')) {
      return <FaPercentage className="stat-icon" />;
    } else if (titleLower.includes('win')) {
      return <FaArrowUp className="stat-icon win" />;
    } else if (titleLower.includes('loss')) {
      return <FaArrowDown className="stat-icon loss" />;
    } else {
      return <FaMoneyBillWave className="stat-icon" />;
    }
  };

  return (
    <div className="stat-card">
      <div className="stat-card-content">
        <div className="stat-card-icon">
          {getIcon()}
        </div>
        <div className="stat-card-text">
          <h3>{title}</h3>
          <p>{value}</p>
        </div>
      </div>
    </div>
  );
};

// Add prop validation
StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default StatCard;