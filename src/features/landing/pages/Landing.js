// src/features/landing/pages/Landing.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSocket } from 'features/common/contexts/SocketContext';
import { jwtDecode } from "jwt-decode";
import { FaSignInAlt, FaUserPlus, FaUsers, FaTrophy, FaChess } from 'react-icons/fa';
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [stats, setStats] = useState({ onlineUsers: 0, gamesPlayed: 0, activeBets: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // For testing purposes: expose a function to handle token validation
  // This will be called directly from tests
  window.testTokenValidation = (token, navigateFunc) => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === "admin") {
          navigateFunc("/admin/dashboard");
          return true;
        } else {
          navigateFunc("/home");
          return true;
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
      }
    }
    return false;
  };

  // Normal useEffect for token validation in the actual application
  useEffect(() => {
    const token = localStorage.getItem("token");
    window.testTokenValidation(token, navigate);
  }, [navigate]);

  // Socket logic effect
  useEffect(() => {
    setIsLoading(true);
    if (socket) {
      socket.on("liveStats", (data) => {
        console.log("Received liveStats event:", data);
        setStats({
          onlineUsers: data.onlineUsers || 0,
          gamesPlayed: data.gamesPlayed || 0,
          activeBets: data.activeBets || 0
        });
        setIsLoading(false);
      });
      // Request live stats explicitly
      socket.emit("getLiveStats");

      // Set a timeout to show placeholder stats if socket is slow
      const timeout = setTimeout(() => {
        if (isLoading) {
          setStats({
            onlineUsers: Math.floor(Math.random() * 50) + 100,
            gamesPlayed: Math.floor(Math.random() * 200) + 500,
            activeBets: Math.floor(Math.random() * 30) + 50
          });
          setIsLoading(false);
        }
      }, 2000);

      return () => {
        socket.off("liveStats");
        clearTimeout(timeout);
      };
    }
  }, [socket, isLoading]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50, damping: 10 }
    }
  };

  const statsVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  return (
    <motion.div 
      className="landing-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <section className="hero-section">
        <motion.div 
          className="hero-content"
          variants={itemVariants}
        >
          <div className="logo-container">
            <img src="/assets/logo.png" alt="Horsey Logo" className="hero-logo" />
            <h1 className="hero-title">HORSEY</h1>
          </div>
          <motion.h2 
            className="hero-subtitle"
            variants={itemVariants}
          >
            The Ultimate Chess Betting Platform
          </motion.h2>
          <motion.p 
            className="hero-description"
            variants={itemVariants}
          >
            Bet, Play, Win. Challenge players, make strategic wagers, and climb the leaderboards.
          </motion.p>
          <motion.div 
            className="hero-buttons"
            variants={itemVariants}
          >
            <motion.button 
              className="cta-button"
              onClick={() => navigate("/register")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaUserPlus className="button-icon" />
              Get Started
            </motion.button>
            <motion.button 
              className="login-button"
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSignInAlt className="button-icon" />
              Login
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Live Stats Section */}
      <motion.section 
        className="stats-section"
        variants={itemVariants}
      >
        <motion.h3 
          className="stats-title"
          variants={itemVariants}
        >
          Live Platform Stats
        </motion.h3>
        <motion.div 
          className="stats-cards"
          variants={itemVariants}
        >
          <motion.div 
            className="stat-card"
            variants={statsVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}
          >
            <FaUsers className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{stats.onlineUsers}</span>
              <span className="stat-label">Online Players</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            variants={statsVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}
          >
            <FaChess className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{stats.gamesPlayed}</span>
              <span className="stat-label">Games Today</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            variants={statsVariants}
            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}
          >
            <FaTrophy className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{stats.activeBets || 0}</span>
              <span className="stat-label">Active Bets</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Footer Call to Action */}
      <motion.div 
        className="cta-section"
        variants={itemVariants}
      >
        <h3 className="cta-title">Ready to test your skills?</h3>
        <motion.button 
          className="cta-button large"
          onClick={() => navigate("/register")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Join Horsey Now
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Landing;
