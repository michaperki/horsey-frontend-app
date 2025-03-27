// src/features/layout/components/Sidebar.js

import React from 'react';
import { motion } from 'framer-motion';
import { FaChessKnight, FaTrophy, FaGift, FaInfoCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useLichess } from '../../auth/contexts/LichessContext';
import './Sidebar.css';

const Sidebar = () => {
  const { lichessConnected } = useLichess();
  
  const sidebarItems = [
    { id: 1, title: 'Daily Challenge', icon: <FaChessKnight />, badge: 'New', link: '/challenge' },
    { id: 2, title: 'Tournaments', icon: <FaTrophy />, badge: 'Soon', link: '/tournaments' },
    { id: 3, title: 'Rewards', icon: <FaGift />, link: '/rewards' }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <motion.div 
      className="sidebar-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="sidebar-content">
        <motion.div
          className="sidebar-section"
          variants={itemVariants}
        >
          <h3>Quick Links</h3>
          <ul className="sidebar-menu">
            {sidebarItems.map((item) => (
              <motion.li 
                key={item.id}
                variants={itemVariants}
                whileHover={{ x: 3 }}
              >
                <Link to={item.link} className="sidebar-link">
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-text">{item.title}</span>
                  {item.badge && (
                    <span className="sidebar-badge">{item.badge}</span>
                  )}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>
        
        {!lichessConnected && (
          <motion.div 
            className="sidebar-tip"
            variants={itemVariants}
          >
            <div className="tip-icon">
              <FaInfoCircle />
            </div>
            <p>Connect your Lichess account to enhance your gaming experience.</p>
          </motion.div>
        )}
      </div>
      
    </motion.div>
  );
};

export default Sidebar;