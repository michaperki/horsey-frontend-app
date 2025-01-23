
// src/components/StatCard.js

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './StatCard.css';

// Import necessary icons from Font Awesome
import {
  faGamepad,
  faTrophy,
  faCoins,
  faBalanceScale,
  faDollarSign,
  faChartLine,
  faPercentage,
  faArrowUp,
  faArrowDown,
  faMedal,
  faCrown,
  faHeart,
  faSmile,
  faStar,
  faGift,
  faWallet
} from '@fortawesome/free-solid-svg-icons';

const iconMapping = {
  'Total Games Played': faGamepad,
  'Average Wager': faCoins,
  'Total Wagered': faWallet, // Ensure faWallet is imported if used
  'Average ROI': faChartLine,
  'Total Winnings': faTrophy,
  'Total Losses': faArrowDown,
  'Membership': faStar,
  'Karma': faHeart,
  'Points': faGift,
};

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <FontAwesomeIcon icon={icon} size="2x" />
      </div>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
};

export default StatCard;

