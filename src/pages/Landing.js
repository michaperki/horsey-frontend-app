
// frontend/src/pages/Landing.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Ensure this is correctly imported
import "./Landing.css"; // Link to the CSS file

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/home");
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  return (
    <div className="landing-container">
      <div className="hero-section">
        <h1>Welcome to Horsey</h1>
        <p>Bet, Play, Win. Join the ultimate chess gaming experience!</p>
        <button className="cta-button" onClick={() => navigate("/register")}>
          Get Started
        </button>
      </div>
      <div className="live-stats">
        <h3>Live Stats</h3>
        <p>Online Users: 6,100</p>
        <p>Games Played Today: 168,148</p>
      </div>
    </div>
  );
};

export default Landing;
