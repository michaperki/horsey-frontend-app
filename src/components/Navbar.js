
/* src/components/Navbar.js */

import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToken } from '../contexts/TokenContext';
import {
  getLichessStatus,
  initiateLichessOAuth,
} from '../services/api';
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
  const [lichessConnected, setLichessConnected] = useState(false);
  const { unreadCount } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  // Refs for the user info and dropdown
  const userInfoRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (token && user) {
        setLoading(true);
        setError(null);
        try {
          // Fetch Lichess connection status
          const isConnected = await getLichessStatus();
          setLichessConnected(isConnected);

          // Additional data fetching can be done here if needed
        } catch (err) {
          console.error('Error fetching Navbar data:', err);
          if (err.message === 'Unauthorized') {
            logout();
            navigate('/login');
          } else {
            setError('Failed to load data. Please try again.');
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLichessConnected(false);
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, logout, navigate]);

  const handleLogout = () => {
    logout();
    console.log('User has logged out.');
    navigate('/');
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleConnectLichess = () => {
    try {
      initiateLichessOAuth(); // Trigger OAuth flow
    } catch (err) {
      console.error('Error initiating Lichess OAuth:', err);
      setError('Failed to initiate connection. Please try again.');
    }
  };

  const handleGetCoins = () => {
    console.log('Redirect to Get Coins Page');
    navigate('/get-coins'); // Example navigation to Get Coins page
  };

  // Handler to close the dropdown
  const closeDropdown = () => {
    setShowDropdown(false);
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

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Unbind the event listener on clean up
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
                  className="navbar__connect-button"
                  disabled={loading}
                  aria-busy={loading} // Accessibility attribute
                  title="Connect Lichess"
                  aria-label="Connect Lichess"
                >
                  {loading ? (
                    <FaSpinner className="spinner" aria-label="Connecting" />
                  ) : (
                    <FaChess />
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
            tokenBalance={tokenBalance} // Pass the raw number
            sweepstakesBalance={sweepstakesBalance} // Pass the raw number
            onGetCoins={handleGetCoins}
          />
        )}

        {/* Icons and User Info */}
        {token && user && (
          <div className="navbar__user-section">
            <div className="navbar__icons">
              <div className="navbar__icon-container">
                <FaBell className="navbar__icon" title="Notifications" aria-label="Notifications" />
                {unreadCount > 0 && <span className="navbar__badge">{unreadCount}</span>}
              </div>
            </div>
            <div
              className="navbar__user-info"
              onClick={toggleDropdown}
              ref={userInfoRef} // Attach ref here
              tabIndex={0} // Make it focusable for accessibility
              onKeyDown={(e) => { if (e.key === 'Enter') toggleDropdown(); }} // Handle Enter key
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

