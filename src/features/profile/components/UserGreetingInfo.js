// src/features/profile/components/UserGreetingInfo.js

import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const UserGreetingInfo = ({
  lichessConnected,
  lichessUsername = '',
  statistics = { username: '', karma: 0, membership: 'Free', ratingClass: 'Class B' },
}) => {
  // Always use the lichessUsername if available, otherwise use statistics.username or default
  const username = lichessUsername || statistics.username || 'User';
  const karma = statistics.karma;
  const membership = statistics.membership;
  const ratingClass = statistics.ratingClass;

  return (
    <motion.div 
      className="lichess-greeting-and-info mb-md text-center"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2 
        className="text-white font-bold text-xl mb-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Welcome back, {username}!
      </motion.h2>
      <motion.div 
        className="additional-info-section flex justify-center gap-5 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="info-grid">
          <div className="info-item">
            <span>Karma:</span> {karma}
          </div>
          <div className="info-item">
            <span>Membership:</span> {membership}
          </div>
          <div className="info-item">
            <span>Rating Class:</span> {ratingClass}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

UserGreetingInfo.propTypes = {
  lichessConnected: PropTypes.bool.isRequired,
  lichessUsername: PropTypes.string,
  statistics: PropTypes.shape({
    username: PropTypes.string,
    karma: PropTypes.number,
    membership: PropTypes.string,
    ratingClass: PropTypes.string,
  }),
};

export default UserGreetingInfo;
