// src/features/stats/components/VerticalTabs.js

import React from 'react';
import { motion } from 'framer-motion';
import './VerticalTabs.css';

const VerticalTabs = ({ activeTab, setActiveTab, tabIcons, isMobile }) => {
  // Tabs configuration
  const tabs = [
    { id: 'Summary', label: 'Summary' },
    { id: 'Ratings', label: 'Ratings' },
    { id: 'History', label: 'History' }
  ];

  // Animation variants
  const tabVariants = {
    inactive: { 
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderLeft: '3px solid transparent',
      opacity: 0.7
    },
    active: { 
      backgroundColor: 'rgba(30, 64, 104, 0.5)',
      borderLeft: '3px solid var(--color-primary-light)',
      opacity: 1
    },
    hover: { 
      backgroundColor: 'rgba(30, 64, 104, 0.3)',
      opacity: 0.9
    }
  };

  // Render horizontal tabs for mobile
  if (isMobile) {
    return (
      <motion.div 
        className="horizontal-tabs"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`horizontal-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tabIcons[tab.id] && (
              <span className="tab-icon">{tabIcons[tab.id]}</span>
            )}
            <span className="tab-text">{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>
    );
  }

  // Render vertical tabs for desktop
  return (
    <motion.div 
      className="vertical-tabs"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          className={`vertical-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          variants={tabVariants}
          initial="inactive"
          animate={activeTab === tab.id ? "active" : "inactive"}
          whileHover="hover"
          transition={{ duration: 0.2 }}
          aria-selected={activeTab === tab.id}
          role="tab"
        >
          {tabIcons[tab.id] && (
            <span className="tab-icon">{tabIcons[tab.id]}</span>
          )}
          <span className="tab-text">{tab.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default VerticalTabs;