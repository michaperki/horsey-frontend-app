
// src/components/StatCard.js

import React from 'react';
import PropTypes from 'prop-types';
// Removed import './StatCard.css';

const StatCard = ({ title, value }) => {
  return (
    <div className="stat-card bg-statcard p-md rounded-md flex flex-col items-center shadow-md transition-colors duration-200">
      <h3 className="text-yellow-400 font-semibold text-sm">{title}</h3>
      <p className="text-white font-bold text-md">{value}</p>
    </div>
  );
};

// Add prop validation
StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default StatCard;

