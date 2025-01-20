
// src/components/Navbar.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { token, user, logout } = useAuth();
  const [lichessConnected, setLichessConnected] = useState(false);

  useEffect(() => {
    const fetchLichessStatus = async () => {
      if (token && user) { // Ensure both token and user are present
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
  }, [token, user]); // Added 'user' as a dependency

  const handleLogout = () => {
    logout();
    console.log('User has logged out.');
  };

  return (
    <nav style={styles.nav}>
      {/* Navigation for Authenticated Users */}
      {token && user?.role === 'user' && (
        <>
          <Link to="/home" style={styles.link}>Home</Link>
          <Link to="/lobby" style={styles.link}>Lobby</Link>
          <Link to="/profile" style={styles.link}>Profile</Link>
          <Link to="/notifications" style={styles.link}>Notifications</Link>
          <button onClick={handleLogout} style={styles.button}>Logout</button>

          {!lichessConnected ? (
            <Link to="/connect-lichess" style={styles.link}>
              Connect Lichess
            </Link>
          ) : (
            <Link to="/profile" style={styles.link}>
              Lichess Connected
            </Link>
          )}
        </>
      )}

      {token && user?.role === 'admin' && (
        <>
          <Link to="/admin/dashboard" style={styles.link}>Admin Dashboard</Link>
          <button onClick={handleLogout} style={styles.button}>Logout</button>
        </>
      )}

      {/* Navigation for Unauthenticated Users */}
      {!token && (
        <>
          <Link to="/" style={styles.link}>Logo</Link> {/* Moved inside unauthenticated block */}
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
    flexWrap: "wrap", // Ensures responsiveness
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    padding: "0 10px",
    margin: "5px 0", // Adds spacing for smaller screens
  },
  button: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    margin: "5px 0", // Adds spacing for consistency
  },
};

export default Navbar;

