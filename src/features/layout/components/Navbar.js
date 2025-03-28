// src/features/layout/components/Navbar.js

import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useToken } from '../../token/contexts/TokenContext';
import { useLichess } from '../../auth/contexts/LichessContext';
import BalanceToggle from '../../token/components/BalanceToggle';
import NavbarDropdown from './NavbarDropdown';
import {
  FaBell,
  FaSpinner,
  FaHome,
  FaUsers,
  FaTrophy,
  FaStore,
  FaBars,
  FaTimes,
  FaSignInAlt,
  FaUserPlus,
  FaUserCircle
} from 'react-icons/fa';
import { useNotifications } from '../../notifications/contexts/NotificationsContext';
import './Navbar.css';

const Navbar = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const { tokenBalance, sweepstakesBalance } = useToken();
  const { lichessConnected, connectLichess, loading, shake } = useLichess();
  const { unreadCount } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const userInfoRef = useRef(null);

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

  const handleConnectLichess = async () => {
    try {
      await connectLichess();
    } catch (err) {
      setError("Failed to connect to Lichess. Please try again.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  const handleGetCoins = () => {
    navigate('/store');
  };

  // Add a scroll event listener to change navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar__container">
        <div className="navbar__logo">
          <Link to={token ? "/home" : "/"} onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }} className="navbar__logo-link">
            <img src="/assets/logo.png" alt="App Logo" className="navbar__logo-image" />
            <span className="navbar__logo-text">Horsey</span>
          </Link>
        </div>

        <div 
          className="navbar__hamburger" 
          onClick={toggleMobileMenu} 
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <FaTimes className="hamburger-icon" /> : <FaBars className="hamburger-icon" />}
        </div>

        <div className={`navbar__links ${isMobileMenuOpen ? 'navbar__links--active' : ''}`}>
          {token && user?.role === 'user' && (
            <>
              <Link to="/home" className="navbar__link" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }}>
                <FaHome className="nav-icon" title="Home" aria-label="Home" />
                <span className="nav-text">Home</span>
              </Link>
              <Link to="/lobby" className="navbar__link" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }}>
                <FaUsers className="nav-icon" title="Lobby" aria-label="Lobby" />
                <span className="nav-text">Lobby</span>
              </Link>
              <Link to="/leaderboards" className="navbar__link" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }}>
                <FaTrophy className="nav-icon" title="Leaderboards" aria-label="Leaderboards" />
                <span className="nav-text">Leaderboards</span>
              </Link>
              <Link to="/store" className="navbar__link" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }}>
                <FaStore className="nav-icon" title="Store" aria-label="Store" />
                <span className="nav-text">Store</span>
              </Link>
              {!lichessConnected && (
                <button
                  onClick={handleConnectLichess}
                  className={`navbar__connect-button ${shake ? 'shake' : ''}`}
                  disabled={loading}
                  aria-busy={loading}
                  title="Connect Lichess"
                  aria-label="Connect Lichess"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="spinner" aria-label="Connecting" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <img
                        src="/assets/lichess-icon.png"
                        alt="Lichess Icon"
                        className="navbar__lichess-icon"
                      />
                      <span>Connect Lichess</span>
                    </>
                  )}
                </button>
              )}
            </>
          )}

          {token && user?.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" className="navbar__link admin-link" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }}>
                <FaTrophy className="nav-icon" title="Admin Dashboard" aria-label="Admin Dashboard" />
                <span className="nav-text">Admin Dashboard</span>
              </Link>
            </>
          )}

          {!token && (
            <>
              <Link to="/login" className="navbar__link auth-link" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }}>
                <FaSignInAlt className="nav-icon" title="Login" aria-label="Login" />
                <span className="nav-text">Login</span>
              </Link>
              <Link to="/register" className="navbar__link auth-link register" onClick={() => { closeDropdown(); setIsMobileMenuOpen(false); }}>
                <FaUserPlus className="nav-icon" title="Register" aria-label="Register" />
                <span className="nav-text">Register</span>
              </Link>
            </>
          )}
        </div>

        {token && user && (
          <BalanceToggle
            tokenBalance={tokenBalance}
            sweepstakesBalance={sweepstakesBalance}
            onGetCoins={handleGetCoins}
          />
        )}

        {token && user && (
          <div className="navbar__user-section">
            <div className="navbar__icons">
              <div className="navbar__icon-container" onClick={() => navigate('/notifications')}>
                <FaBell
                  className="navbar__icon"
                  title="Notifications"
                  aria-label="Notifications"
                />
                {unreadCount > 0 && (
                  <span className="navbar__badge pulse">{unreadCount}</span>
                )}
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
              {user.avatar ? (
                <img src={user.avatar} alt="User Avatar" className="navbar__avatar" />
              ) : (
                <FaUserCircle className="navbar__avatar-fallback" />
              )}
              <span className="navbar__username">{user.username || 'User'}</span>
              <span className="navbar__dropdown-arrow">▼</span>
            </div>
            
            {/* Use our new NavbarDropdown component */}
            <NavbarDropdown 
              user={user}
              showDropdown={showDropdown}
              closeDropdown={closeDropdown}
              handleLogout={handleLogout}
              unreadCount={unreadCount}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="navbar__status navbar__status--error" role="alert">
          <span>{error}</span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;