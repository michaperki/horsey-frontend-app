// src/features/store/components/StoreMenu.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FaChevronRight } from 'react-icons/fa';
import './StoreMenu.css';

const StoreMenu = ({ categories, onSelectCategory }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  
  // Handle category selection
  const handleSelectCategory = (category) => {
    setActiveCategory(category);
    onSelectCategory(category);
  };

  // Get icon based on category name
  const getCategoryIcon = (category) => {
    switch(category.toLowerCase()) {
      case 'beginner packs':
        return '🔰';
      case 'standard packs':
        return '🏆';
      case 'premium packs':
        return '💎';
      case 'memberships':
        return '👑';
      default:
        return '🎁';
    }
  };

  return (
    <motion.div 
      className="store-menu"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3>Categories</h3>
      <ul>
        {categories.map((category) => (
          <motion.li 
            key={category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: categories.indexOf(category) * 0.1 }}
          >
            <button
              className={activeCategory === category ? 'active' : ''}
              onClick={() => handleSelectCategory(category)}
            >
              <span className="category-icon">{getCategoryIcon(category)}</span>
              <span className="category-name">{category}</span>
              <FaChevronRight className="category-arrow" />
            </button>
          </motion.li>
        ))}
      </ul>
      
      <div className="store-menu-footer">
        <p>Need help with your purchase?</p>
        <a href="/support" className="support-link">Contact Support</a>
      </div>
    </motion.div>
  );
};

// Add PropTypes validation
StoreMenu.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelectCategory: PropTypes.func.isRequired,
};

export default StoreMenu;