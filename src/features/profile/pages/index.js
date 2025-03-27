// src/features/profile/pages/index.js

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileHeader from '../components/Header';
import VerticalTabs from '../components/VerticalTabs';
import Overview from '../components/Overview';
import Ratings from '../components/Ratings';
import History from '../components/History';
// import Items from '../../components/Profile/Items';
// import Friends from '../../components/Profile/Friends';
import Account from '../components/Account';
import './Profile.css';

const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <motion.div
            key="overview"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Overview />
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
          >
            <History />
          </motion.div>
        );
      // case 'Items':
      //   return (
      //     <motion.div
      //       key="items"
      //       variants={tabVariants}
      //       initial="hidden"
      //       animate="visible"
      //       exit="exit"
      //     >
      //       <Items />
      //     </motion.div>
      //   );
      // case 'Friends':
      //   return (
      //     <motion.div
      //       key="friends"
      //       variants={tabVariants}
      //       initial="hidden"
      //       animate="visible"
      //       exit="exit"
      //     >
      //       <Friends />
      //     </motion.div>
      //   );
      case 'Account':
        return (
          <motion.div
            key="account"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Account />
          </motion.div>
        );
      default:
        return (
          <motion.div
            key="overview"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Overview />
          </motion.div>
        );
    }
  };

  return (
    <motion.div 
      className="profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ProfileHeader />
      </motion.div>
      
      <div className="profile-content">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <VerticalTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </motion.div>
        
        <div className="profile-tab-content">
          <AnimatePresence mode="wait">
            {renderActiveTab()}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;