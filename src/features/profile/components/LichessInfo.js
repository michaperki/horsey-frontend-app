// src/features/profile/components/LichessInfo.js

import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FaChess, FaCalendarAlt, FaChessKnight, FaChessRook } from 'react-icons/fa';
import { formatDate } from 'features/common/utils/formatDate';
import './LichessInfo.css';

const LichessInfo = ({ info }) => {
  const connectedDate = formatDate(info.connectedAt);

  // Access standard and variant ratings
  const standardRatings = (info.ratings && info.ratings.standard) || {};
  const variantRatings = (info.ratings && info.ratings.variants) || {};

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.05,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <motion.div 
      className="lichess-info-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="lichess-info-header">
        <div className="lichess-user-info">
          <FaChess className="lichess-icon" />
          <div className="lichess-details">
            <h4 className="lichess-username">{info.username}</h4>
            <div className="connected-date">
              <FaCalendarAlt className="date-icon" />
              <span data-testid="connected-date">{connectedDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ratings-container">
        {/* Display Standard Ratings */}
        <motion.div 
          className="ratings-section standard-ratings"
          variants={itemVariants}
        >
          <div className="ratings-header">
            <FaChessRook className="ratings-icon" />
            <h4>Standard Ratings</h4>
          </div>
          
          {Object.keys(standardRatings).length > 0 ? (
            <div className="ratings-grid">
              {Object.entries(standardRatings).map(([gameType, rating], index) => (
                <motion.div
                  key={gameType}
                  className={`rating-card ${gameType === 'classical' ? 'highlight' : ''}`}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <span className="rating-type">{capitalizeFirstLetter(gameType)}</span>
                  <span className="rating-value">{rating !== null ? rating : 'N/A'}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="no-ratings">No standard ratings available.</p>
          )}
        </motion.div>

        {/* Display Variant Ratings */}
        <motion.div 
          className="ratings-section variant-ratings"
          variants={itemVariants}
        >
          <div className="ratings-header">
            <FaChessKnight className="ratings-icon" />
            <h4>Variant Ratings</h4>
          </div>
          
          {Object.keys(variantRatings).length > 0 ? (
            <div className="ratings-grid">
              {Object.entries(variantRatings).map(([variant, rating], index) => (
                <motion.div
                  key={variant}
                  className="rating-card variant"
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <span className="rating-type">{capitalizeFirstLetter(variant)}</span>
                  <span className="rating-value">{rating !== null ? rating : 'N/A'}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="no-ratings">No variant ratings available.</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

LichessInfo.propTypes = {
  info: PropTypes.shape({
    username: PropTypes.string.isRequired,
    connectedAt: PropTypes.string,
    ratings: PropTypes.shape({
      standard: PropTypes.objectOf(PropTypes.number),
      variants: PropTypes.objectOf(PropTypes.number),
    }),
  }).isRequired,
};

export default LichessInfo;
