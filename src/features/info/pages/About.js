// src/features/info/pages/About.js

import React from 'react';
import { motion } from 'framer-motion';
import { FaChess, FaTrophy, FaCoins, FaUserShield, FaGlobe } from 'react-icons/fa';
import './InfoPages.css';

const AboutPage = () => {
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <motion.div 
      className="info-page-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div className="info-page-header" variants={itemVariants}>
        <div className="info-page-icon">
          <FaChess />
        </div>
        <h1>About Horsey</h1>
      </motion.div>

      <motion.div className="info-page-content" variants={itemVariants}>
        <motion.p className="info-page-intro" variants={itemVariants}>
          Welcome to Horsey – the premier platform where chess meets competitive wagering. 
          We've created a space where players can test their skills, compete for tokens, 
          and join a thriving community of chess enthusiasts from around the world.
        </motion.p>

        <motion.div className="info-card" variants={itemVariants}>
          <div className="info-card-header">
            <FaTrophy className="info-card-icon" />
            <h2>Our Mission</h2>
          </div>
          <p className="info-card-content">
            Our mission is to revolutionize the world of online chess by creating a secure, engaging, and rewarding 
            environment where players of all skill levels can compete for fun and stakes. We believe in fostering 
            a community that values fair play, continuous improvement, and the time-honored traditions of chess.
          </p>
        </motion.div>

        <motion.div className="info-columns" variants={itemVariants}>
          <motion.div className="info-column" variants={itemVariants} whileHover={{ y: -5 }}>
            <FaCoins className="info-column-icon" />
            <h3>Token Economy</h3>
            <p>Our dual-token system lets you compete with player tokens for real stakes, 
              or use sweepstakes tokens for risk-free competition.</p>
          </motion.div>
          
          <motion.div className="info-column" variants={itemVariants} whileHover={{ y: -5 }}>
            <FaUserShield className="info-column-icon" />
            <h3>Fair Play</h3>
            <p>We employ advanced anti-cheating measures and a dedicated team to ensure 
              all games are fair and competitive.</p>
          </motion.div>
          
          <motion.div className="info-column" variants={itemVariants} whileHover={{ y: -5 }}>
            <FaGlobe className="info-column-icon" />
            <h3>Global Community</h3>
            <p>Join thousands of players from around the world in tournaments, 
              matches, and our active community forums.</p>
          </motion.div>
        </motion.div>

        <motion.div className="info-card" variants={itemVariants}>
          <div className="info-card-header">
            <h2>Our Story</h2>
          </div>
          <p className="info-card-content">
            Horsey was founded in 2024 by a team of passionate chess players and gaming enthusiasts who saw 
            an opportunity to bring together the strategic depth of chess with the excitement of competitive wagering. 
            Starting with a small community of dedicated players, we've grown rapidly to become the destination 
            for those seeking a new dimension to their chess experience.
            <br /><br />
            Today, we're proud to host thousands of games daily, with players from over 50 countries competing 
            across various formats and stake levels. Our integration with Lichess ensures a seamless experience 
            for players familiar with one of the world's most popular chess platforms, while our unique features 
            and token system provide a fresh approach to competitive chess.
          </p>
        </motion.div>

        <motion.div className="info-card cta-card" variants={itemVariants}>
          <h2>Join Us Today</h2>
          <p>Ready to experience chess like never before? Create an account, connect your Lichess profile, 
            and dive into the exciting world of competitive chess on Horsey!</p>
          <button className="cta-button">Register Now</button>
        </motion.div>

        <motion.div className="info-page-footer" variants={itemVariants}>
          <p>© 2025 Horsey. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AboutPage;