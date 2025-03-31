// src/features/profile/pages/index.js

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaChartLine, 
  FaHistory, 
  FaGift, 
  FaUserFriends, 
  FaCog,
  FaCoins,
  FaTrophy,
  FaChessKnight
} from 'react-icons/fa';
import { useAuth } from 'features/auth/contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import ProfileHeader from '../components/ProfileHeader';
import VerticalTabs from '../components/VerticalTabs';
import Overview from '../components/Overview';
import Ratings from '../components/Ratings';
import History from '../components/History';
import Account from '../components/Account';
import UserSeasonStats from '../components/UserSeasonStats';
import UserGreetingInfo from '../components/UserGreetingInfo';
import './Profile.css';

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
  'Overview': <FaChartLine />,
  'Ratings': <FaChartLine />,
  'History': <FaHistory />,
  'Items': <FaGift />,
  'Friends': <FaUserFriends />,
  'Account': <FaCog />
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const [lichessConnected, setLichessConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view on mount and window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set Lichess connected status based on profile data
  useEffect(() => {
    if (profile && profile.lichessUsername) {
      setLichessConnected(true);
    }
  }, [profile]);

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
            className="tab-content-container"
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
      case 'Items':
        return (
          <motion.div
            key="items"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="tab-content-container"
          >
            <div className="coming-soon-container">
              <FaGift className="coming-soon-icon" />
              <h3>Items Coming Soon</h3>
              <p>Customize your experience with items and collectibles</p>
            </div>
          </motion.div>
        );
      case 'Friends':
        return (
          <motion.div
            key="friends"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="tab-content-container"
          >
            <div className="coming-soon-container">
              <FaUserFriends className="coming-soon-icon" />
              <h3>Friends Coming Soon</h3>
              <p>Connect with other players and track their progress</p>
            </div>
          </motion.div>
        );
      case 'Account':
        return (
          <motion.div
            key="account"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="tab-content-container"
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
            className="tab-content-container"
          >
            <Overview />
          </motion.div>
        );
    }
  };

  return (
    <motion.div 
      className="profile-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Profile Header */}
      <motion.div
        className="profile-header-wrapper"
        variants={containerVariants}
      >
        <ProfileHeader />
      </motion.div>
      
      {/* User Info Panel */}
      <motion.div 
        className="user-info-panel"
        variants={containerVariants}
      >
        <div className="user-avatar">
          <div className="avatar-wrapper">
            {user?.avatar ? (
              <img src={user.avatar} alt={`${user?.username || 'User'}'s avatar`} />
            ) : (
              <div className="avatar-placeholder">
                <FaUser />
              </div>
            )}
          </div>
        </div>
        
        <div className="user-stats">
          <UserGreetingInfo 
            lichessConnected={lichessConnected}
            lichessUsername={profile?.lichessUsername}
            statistics={{
              username: user?.username || 'User',
              karma: profile?.karma || 0,
              membership: profile?.membership || 'Free',
              ratingClass: profile?.ratingClass || 'Class B'
            }}
          />
          
          <div className="balance-cards">
            <motion.div 
              className="balance-card token-card"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="card-icon">
                <FaCoins />
              </div>
              <div className="card-details">
                <h3 className="card-value">{profile?.tokenBalance || '0'}</h3>
                <p className="card-label">Token Balance</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="balance-card sweepstakes-card"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="card-icon">
                <FaChessKnight />
              </div>
              <div className="card-details">
                <h3 className="card-value">{profile?.sweepstakesBalance || '0'}</h3>
                <p className="card-label">Sweepstakes</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Season Stats Section */}
      <motion.div
        className="season-stats-wrapper"
        variants={containerVariants}
      >
        <UserSeasonStats />
      </motion.div>
      
      {/* Main Content */}
      <motion.div 
        className="profile-content"
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
        
        <div className="profile-tab-content">
          <AnimatePresence mode="wait">
            {renderActiveTab()}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Profile Badges - Optional Section */}
      <motion.div
        className="profile-badges-section"
        variants={containerVariants}
      >
        <h3 className="section-title">
          <FaTrophy className="section-icon" />
          <span>Achievements & Badges</span>
        </h3>
        <div className="badges-container">
          {loading ? (
            <p className="loading-text">Loading achievements...</p>
          ) : (profile?.achievements && profile.achievements.length > 0) ? (
            profile.achievements.map((badge, index) => (
              <motion.div 
                key={index}
                className="badge-item"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
                }}
              >
                {badge.icon}
                <span className="badge-name">{badge.name}</span>
              </motion.div>
            ))
          ) : (
            <div className="empty-badges">
              <p>No achievements yet. Keep playing to earn badges!</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;
