
// src/components/Navbar.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const Navbar = () => {
  const { token, user, logout } = useAuth(); // Use AuthContext
  const [lichessConnected, setLichessConnected] = useState(false);

  useEffect(() => {
    const fetchLichessStatus = async () => {
      if (token) {
        try {
          const response = await fetch('/lichess/status', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setLichessConnected(data.connected);
          } else {
            setLichessConnected(false);
          }
        } catch (error) {
          console.error('Error fetching Lichess status:', error);
          setLichessConnected(false);
        }
      } else {
        setLichessConnected(false);
      }
    };

    fetchLichessStatus();
  }, [token]);

  const handleLogout = () => {
    logout(); // Use logout from AuthContext
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.link}>Home</Link>
      {user && user.role === 'user' && (
        <>
          <Link to="/dashboard" style={styles.link}>Dashboard</Link>
          <Link to="/available-bets" style={styles.link}>Available Bets</Link> {/* New Link */}
          <Link to="/profile" style={styles.link}>Profile</Link>
          <Link to="/notifications" style={styles.link}>Notifications</Link>
          <button onClick={handleLogout} style={styles.button}>Logout</button>

          {/* Lichess Connection */}
          {!lichessConnected ? (
            <Link to="/dashboard" style={styles.link}> {/* Redirect to Dashboard where Connect button is */}
              Connect Lichess
            </Link>
          ) : (
            <Link to="/profile" style={styles.link}>
              Lichess Connected
            </Link>
          )}
        </>
      )}
      {user && user.role === 'admin' && (
        <>
          <Link to="/admin/dashboard" style={styles.link}>Admin Dashboard</Link>
          <button onClick={handleLogout} style={styles.button}>Logout</button>
        </>
      )}
      {!user && (
        <>
          <Link to="/login" style={styles.link}>User Login</Link>
          <Link to="/register" style={styles.link}>Register</Link>
          <Link to="/admin/login" style={styles.link}>Admin Login</Link>
        </>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "#343a40",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    padding: "0 10px",
  },
  button: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Navbar;

