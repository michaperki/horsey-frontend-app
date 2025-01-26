
// src/components/Navbar.js

import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToken } from '../contexts/TokenContext';
import { useLichess } from '../contexts/LichessContext'; // Import Lichess context
import BalanceToggle from './BalanceToggle';
import {
  FaBell,
  FaSpinner,
  FaHome,
  FaUsers,
  FaTrophy,
  FaStore,
  FaBars,
  FaTimes,
  FaChess,
  FaSignInAlt,
  FaUserPlus,
} from 'react-icons/fa';
import { useNotifications } from '../contexts/NotificationsContext';
import './Navbar.css';

const Navbar = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const { tokenBalance, sweepstakesBalance } = useToken();
  const { lichessConnected, connectLichess, loading, triggerShake, shake } = useLichess(); // Destructure from Lichess context
  const { unreadCount } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  const userInfoRef = useRef(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleConnectLichess = () => {
    connectLichess(); // Use context function
  };

  // Handler to close the dropdown
  const closeDropdown = () => {
    setShowDropdown(false);
  };

  const handleGetCoins = () => {
    navigate('/store'); // Example navigation to Get Coins page
  };

  // Handler to detect clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDropdown &&
        userInfoRef.current &&
        !userInfoRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <nav className="navbar">
      <div className="navbar__container">
        {/* Logo */}
        <div className="navbar__logo">
          <Link to={token ? "/home" : "/"} onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }}>
            <img src="/assets/logo.png" alt="App Logo" className="navbar__logo-image" />
            <span className="navbar__logo-text">Horsey</span>
          </Link>
        </div>

        {/* Hamburger Menu Icon */}
        <div className="navbar__hamburger" onClick={toggleMobileMenu} aria-label="Toggle navigation menu">
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Navigation Links */}
        <div className={`navbar__links ${isMobileMenuOpen ? 'navbar__links--active' : ''}`}>
          {token && user?.role === 'user' && (
            <>
              <Link to="/home" className="navbar__link" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }}>
                <FaHome title="Home" aria-label="Home" />
              </Link>
              <Link to="/lobby" className="navbar__link" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }}>
                <FaUsers title="Lobby" aria-label="Lobby" />
              </Link>
              <Link to="/leaderboards" className="navbar__link" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }}>
                <FaTrophy title="Leaderboards" aria-label="Leaderboards" />
              </Link>
              <Link to="/store" className="navbar__link" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }}>
                <FaStore title="Store" aria-label="Store" />
              </Link>
              {!lichessConnected && (
                <button
                  onClick={handleConnectLichess}
                  className={`navbar__connect-button ${shake ? 'shake' : ''}`} // Add shake class conditionally
                  disabled={loading}
                  aria-busy={loading}
                  title="Connect Lichess"
                  aria-label="Connect Lichess"
                >
                  {loading ? (
                    <FaSpinner className="spinner" aria-label="Connecting" />
                  ) : (
                    <img
                      src="/assets/lichess-icon.png"
                      alt="Lichess Icon"
                      className="navbar__lichess-icon"
                    />
                  )}
                </button>
              )}
            </>
          )}

          {token && user?.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" className="navbar__link" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }}>
                <FaTrophy title="Admin Dashboard" aria-label="Admin Dashboard" />
              </Link>
            </>
          )}

          {!token && (
            <>
              <Link to="/login" className="navbar__link" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }}>
                <FaSignInAlt title="Login" aria-label="Login" />
              </Link>
              <Link to="/register" className="navbar__link" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }}>
                <FaUserPlus title="Register" aria-label="Register" />
              </Link>
            </>
          )}
        </div>

        {/* Balance Toggle */}
        {token && user && (
          <BalanceToggle
            tokenBalance={tokenBalance}
            sweepstakesBalance={sweepstakesBalance}
            onGetCoins={handleGetCoins}
          />
        )}

        {/* Icons and User Info */}
        {token && user && (
          <div className="navbar__user-section">
            <div className="navbar__icons">
              <div className="navbar__icon-container">
                <FaBell
                  className="navbar__icon"
                  title="Notifications"
                  aria-label="Notifications"
                  onClick={() => navigate('/notifications')}
                />
                {unreadCount > 0 && <span className="navbar__badge">{unreadCount}</span>}
              </div>
            </div>
            <div
              className="navbar__user-info"
              onClick={toggleDropdown}
              ref={userInfoRef}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') toggleDropdown(); }}
              aria-haspopup="true"
              aria-expanded={showDropdown}
            >
              <img src={user.avatar || "/assets/default-avatar.png"} alt="User Avatar" className="navbar__avatar" />
              <span className="navbar__dropdown-arrow">▼</span>
            </div>
            {showDropdown && (
              <div className="navbar__dropdown" ref={dropdownRef} role="menu">
                <Link to="/profile" className="navbar__dropdown-item" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }} role="menuitem">
                  Profile
                </Link>
                <Link to="/settings" className="navbar__dropdown-item" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }} role="menuitem">
                  Settings
                </Link>
                <Link to="/notifications" className="navbar__dropdown-item" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }} role="menuitem">
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </Link>
                <button onClick={() => { handleLogout(); closeDropdown(); setIsMobileMenuOpen(false); }} className="navbar__dropdown-item logout" role="menuitem">
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="navbar__status navbar__status--error" role="alert">
          <span>{error}</span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

