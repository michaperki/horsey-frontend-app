
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToken } from '../contexts/TokenContext';
import {
  getLichessStatus,
  getUserData,
  initiateLichessOAuth,
} from '../services/api';
import BalanceToggle from './BalanceToggle';
import { FaBell, FaTrophy } from 'react-icons/fa'; // Importing additional icons
import './Navbar.css';

const Navbar = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const { tokenBalance, sweepstakesBalance } = useToken();
  const [lichessConnected, setLichessConnected] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tokenBalance: scBalance, sweepstakesBalance: gcBalance } = useToken();
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

          // Fetch user data including notifications
          const userData = await getUserData();
          setNotificationsCount(userData.notifications || 0);
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
        setNotificationsCount(0);
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
      {/* Logo */}
      <div className="navbar__logo">
        <Link to={token ? "/home" : "/"} onClick={closeDropdown}>
          <img src="/assets/logo.png" alt="App Logo" className="navbar__logo-image" />
          <span className="navbar__logo-text">Horsey</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="navbar__links">
        {token && user?.role === 'user' && (
          <>
            <Link to="/home" className="navbar__link" onClick={closeDropdown}>Home</Link>
            <Link to="/lobby" className="navbar__link" onClick={closeDropdown}>Lobby</Link>
            <Link to="/leaderboards" className="navbar__link" onClick={closeDropdown}>Leaderboards</Link>
            <Link to="/store" className="navbar__link" onClick={closeDropdown}>Store</Link>
            {!lichessConnected && (
              <button
                onClick={handleConnectLichess}
                className="navbar__connect-button" // Unique CSS class
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Connect Lichess'}
              </button>
            )}
          </>
        )}

        {token && user?.role === 'admin' && (
          <>
            <Link to="/admin/dashboard" className="navbar__link" onClick={closeDropdown}>Admin Dashboard</Link>
          </>
        )}

        {!token && (
          <>
            <Link to="/login" className="navbar__link" onClick={closeDropdown}>Login</Link>
            <Link to="/register" className="navbar__link" onClick={closeDropdown}>Register</Link>
          </>
        )}
      </div>

      {/* Balance Toggle */}
      {token && user && (
        <BalanceToggle
          tokenBalance={tokenBalance.toFixed(2)} // Ensure the balance is formatted
          sweepstakesBalance={sweepstakesBalance.toLocaleString()} // Format large numbers with commas
          onGetCoins={handleGetCoins}
        />
      )}

      {/* Icons and User Info */}
      {token && user && (
        <div className="navbar__user-section">
          <div className="navbar__icons">
            <div className="navbar__icon-container">
              <FaBell className="navbar__icon" />
              {notificationsCount > 0 && <span className="navbar__badge">{notificationsCount}</span>}
            </div>
          </div>
          <div
            className="navbar__user-info"
            onClick={toggleDropdown}
            ref={userInfoRef} // Attach ref here
          >
            <img src={user.avatar || "/assets/default-avatar.png"} alt="User Avatar" className="navbar__avatar" />
            <div className="navbar__user-text">
              <span className="navbar__username">{user.username}</span>
              <span className="navbar__karma">Karma: {user.karma}</span>
            </div>
            <span className="navbar__dropdown-arrow">▼</span>
          </div>
          {showDropdown && (
            <div className="navbar__dropdown" ref={dropdownRef}> {/* Attach ref here */}
              <Link to="/profile" className="navbar__dropdown-item" onClick={closeDropdown}>Profile</Link>
              <Link to="/settings" className="navbar__dropdown-item" onClick={closeDropdown}>Settings</Link>
              <button onClick={() => { handleLogout(); closeDropdown(); }} className="navbar__dropdown-item logout">Logout</button>
            </div>
          )}
        </div>
      )}

      {/* Loading and Error States */}
      {loading && (
        <div className="navbar__status">
          <span>Loading...</span>
        </div>
      )}
      {error && (
        <div className="navbar__status navbar__status--error">
          <span>{error}</span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

