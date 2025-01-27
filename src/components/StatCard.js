
// src/components/StatCard.js

import React from 'react';
import PropTypes from 'prop-types';
import './StatCard.css';

const StatCard = ({ title, value }) => {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
};

// Add prop validation
StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default StatCard;
