import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from 'features/common/contexts/SocketContext';
import { jwtDecode } from "jwt-decode";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [stats, setStats] = useState({ onlineUsers: 0, gamesPlayed: 0 });

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
    console.log("Landing: Setting up liveStats listener");
    if (socket) {
      socket.on("liveStats", (data) => {
        console.log("Received liveStats event:", data);
        setStats(data);
      });
      // Request live stats explicitly
      socket.emit("getLiveStats");
    }
    
    return () => {
      if (socket) {
        socket.off("liveStats");
      }
    };
  }, [socket]);

  return (
    <div className="landing-container">
      <div className="hero-section">
        <h1>Welcome to Horsey</h1>
        <p>Bet, Play, Win. Join the ultimate chess gaming experience!</p>
        <div className="hero-buttons">
          <button className="cta-button" onClick={() => navigate("/register")}>
            Get Started
          </button>
          <button className="login-button" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </div>
      <div className="live-stats">
        <h3>Live Stats</h3>
        <p>Online Users: {stats.onlineUsers}</p>
        <p>Games Played Today: {stats.gamesPlayed}</p>
      </div>
    </div>
  );
};

export default Landing;