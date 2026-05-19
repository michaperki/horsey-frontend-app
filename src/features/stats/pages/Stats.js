// src/features/stats/pages/Stats.js

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChartLine, 
  FaChessKing, 
  FaHistory
} from 'react-icons/fa';

// Import components that will be moved from profile
import UserSeasonStats from '../../profile/components/UserSeasonStats';
import Ratings from '../../profile/components/Ratings';
import History from '../../profile/components/History';
import StatsSummary from '../components/StatsSummary';
import VerticalTabs from '../components/VerticalTabs';

import './Stats.css';

// Tab animation variants
const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
};

// Page animation variants
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.5
    }
  },
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

// Container animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 15
    }
  }
};

// Icons for each tab
const tabIcons = {
  'Summary': <FaChartLine />,
  'Ratings': <FaChessKing />,
  'History': <FaHistory />
};

const StatsPage = () => {
  const [activeTab, setActiveTab] = useState('Summary');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Summary':
        return (
          <motion.div
            key="summary"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="tab-content-container"
          >
            <StatsSummary />
          </motion.div>
        );
      case 'Ratings':
        return (
          <motion.div
            key="ratings"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="tab-content-container"
          >
            <Ratings />
          </motion.div>
        );
      case 'History':
        return (
          <motion.div
            key="history"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="tab-content-container"
          >
            <History />
          </motion.div>
        );
      default:
        return (
          <motion.div
            key="summary"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="tab-content-container"
          >
            <StatsSummary />
          </motion.div>
        );
    }
  };

  return (
    <motion.div 
      className="stats-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.h1 
        className="stats-page-title"
        variants={containerVariants}
      >
        Player Statistics
      </motion.h1>
      
      {/* Season Stats Section */}
      <motion.div
        className="season-stats-wrapper"
        variants={containerVariants}
      >
        <UserSeasonStats />
      </motion.div>
      
      {/* Main Content */}
      <motion.div 
        className="stats-content"
        variants={containerVariants}
      >
        <motion.div
          className="tabs-container"
          variants={containerVariants}
        >
          <VerticalTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            tabIcons={tabIcons}
            isMobile={isMobile}
          />
        </motion.div>
        
        <div className="stats-tab-content">
          <AnimatePresence mode="wait">
            {renderActiveTab()}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StatsPage;