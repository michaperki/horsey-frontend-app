// src/features/profile/components/ProfileHeader.js

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
import { useAuth } from 'features/auth/contexts/AuthContext';
import './ProfileHeader.css';

const ProfileHeader = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality, e.g., redirect to search results
    console.log('Search for:', searchQuery);
  };

  return (
    <motion.div 
      className="profile-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1 
        className="profile-header-title"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <span className="username-highlight">{user?.username || 'User'}'s</span> Profile
      </motion.h1>
      
      <motion.form 
        onSubmit={handleSearch} 
        className="search-form"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <motion.button 
          type="submit" 
          className="search-button"
          whileHover={{ 
            scale: 1.05,
            backgroundColor: 'var(--color-secondary-light)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          Search
        </motion.button>
      </motion.form>
    </motion.div>
  );
};

export default ProfileHeader;
