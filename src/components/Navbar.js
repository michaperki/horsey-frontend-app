
// src/components/Navbar.js

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToken } from '../contexts/TokenContext'; // Import the TokenContext
import './Navbar.css'; // External CSS file for better organization

const Navbar = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const { tokens /*, setTokens, fetchTokens, tokensLoading, tokensError */ } = useToken();
  const [lichessConnected, setLichessConnected] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchLichessStatus = async () => {
      if (token && user) {
        try {
          const response = await fetch('/lichess/status', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setLichessConnected(data.connected);
          } else if (response.status === 401) {
            console.warn('Unauthorized. Logging out.');
            logout();
            navigate('/login');
          }
        } catch (error) {
          console.error('Error fetching Lichess status:', error);
        }
      }
    };

    const fetchUserNotifications = async () => {
      if (token && user) {
        try {
          const response = await fetch('/user/data', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setNotificationsCount(data.notifications);
            // Assuming tokens are handled by TokenContext
          } else if (response.status === 401) {
            console.warn('Unauthorized. Logging out.');
            logout();
            navigate('/login');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchLichessStatus();
    fetchUserNotifications();
  }, [token, user, logout, navigate]);

  const handleLogout = () => {
    logout();
    console.log('User has logged out.');
    navigate('/');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar__logo">
        <Link to="/home">
          <img src="/assets/logo.png" alt="App Logo" className="navbar__logo-image" />
          <span className="navbar__logo-text">Horsey</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="navbar__links">
        {token && user?.role === 'user' && (
          <>
            <Link to="/home" className="navbar__link">Home</Link>
            <Link to="/lobby" className="navbar__link">Lobby</Link>
            <Link to="/leaderboards" className="navbar__link">Leaderboards</Link>
            <Link to="/store" className="navbar__link">Store</Link>
            {!lichessConnected && (
              <Link to="/connect-lichess" className="navbar__link">Connect Lichess</Link>
            )}
          </>
        )}

        {token && user?.role === 'admin' && (
          <>
            <Link to="/admin/dashboard" className="navbar__link">Admin Dashboard</Link>
          </>
        )}

        {!token && (
          <>
            <Link to="/" className="navbar__link">Home</Link>
            <Link to="/login" className="navbar__link">User Login</Link>
            <Link to="/register" className="navbar__link">Register</Link>
            <Link to="/admin/login" className="navbar__link">Admin Login</Link>
          </>
        )}
      </div>

      {/* Icons and User Info */}
      {token && user && (
        <div className="navbar__user-section">
          <div className="navbar__icons">
            <div className="navbar__icon-container">
              <img src="/assets/bell-icon.svg" alt="Notifications" className="navbar__icon" />
              {notificationsCount > 0 && <span className="navbar__badge">{notificationsCount}</span>}
            </div>
            <div className="navbar__icon-container">
              <img src="/assets/coin-icon.svg" alt="Coins" className="navbar__icon" />
              <span className="navbar__coin-count">{tokens}</span> {/* Use tokens from context */}
            </div>
            {/* Add more icons as needed */}
          </div>
          <div className="navbar__user-info" onClick={toggleDropdown}>
            <img src={user.avatar || "/assets/default-avatar.png"} alt="User Avatar" className="navbar__avatar" />
            <div className="navbar__user-text">
              <span className="navbar__username">{user.username}</span>
              <span className="navbar__karma">Karma: {user.karma}</span>
            </div>
            <span className="navbar__dropdown-arrow">▼</span>
          </div>
          {showDropdown && (
            <div className="navbar__dropdown">
              <Link to="/profile" className="navbar__dropdown-item">Profile</Link>
              <Link to="/settings" className="navbar__dropdown-item">Settings</Link>
              <button onClick={handleLogout} className="navbar__dropdown-item">Logout</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

