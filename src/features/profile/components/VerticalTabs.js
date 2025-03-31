// src/features/profile/components/VerticalTabs.js

import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import './VerticalTabs.css';

const tabs = ['Overview', 'Ratings', 'History', 'Items', 'Friends', 'Account'];

const VerticalTabs = ({ activeTab, setActiveTab, tabIcons, isMobile }) => {
  return (
    <div className={`vertical-tabs ${isMobile ? 'horizontal-layout' : ''}`}>
      {tabs.map((tab, index) => (
        <motion.button
          key={tab}
          className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          onClick={() => setActiveTab(tab)}
          whileHover={{ 
            scale: 1.05,
            backgroundColor: activeTab === tab ? 'var(--color-secondary)' : 'rgba(255, 255, 255, 0.1)'
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            transition: { delay: index * 0.05 }
          }}
        >
          <span className="tab-icon">
            {tabIcons && tabIcons[tab]}
          </span>
          <span className="tab-text">{tab}</span>
        </motion.button>
      ))}
    </div>
  );
};

VerticalTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  tabIcons: PropTypes.object,
  isMobile: PropTypes.bool
};

export default VerticalTabs;
