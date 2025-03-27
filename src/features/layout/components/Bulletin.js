// src/features/layout/components/Bulletin.js

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Bulletin.css';

const Bulletin = () => {
  const [announcements] = useState([
    { id: 1, text: 'New features coming soon!', important: true },
    { id: 2, text: 'Check out our latest updates.', important: false },
    { id: 3, text: 'Join the community tournament.', important: false },
    { id: 4, text: 'Weekend bonus: 2x tokens on all wins!', important: true },
    { id: 5, text: 'New chess variants coming next month.', important: false }
  ]);

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
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <motion.div 
      className="bulletin-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h3 variants={itemVariants}>Announcements</motion.h3>
      <motion.ul variants={containerVariants}>
        <AnimatePresence>
          {announcements.map((announcement) => (
            <motion.li 
              key={announcement.id} 
              className={announcement.important ? 'important' : ''}
              variants={itemVariants}
            >
              {announcement.text}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </motion.div>
  );
};

export default Bulletin;