// src/features/layout/components/NavbarDropdown.js

import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaCog, FaBell, FaSignOutAlt, FaChartBar, FaHistory, FaQuestionCircle } from 'react-icons/fa';
import './NavbarDropdown.css';

const NavbarDropdown = ({ 
  user, 
  showDropdown, 
  closeDropdown, 
  handleLogout,
  unreadCount = 0 
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, closeDropdown]);

  // Groups for better organization
  const accountItems = [
    { 
      icon: <FaUserCircle />, 
      label: 'Profile', 
      path: '/profile' 
    },
    { 
      icon: <FaChartBar />, 
      label: 'Statistics', 
      path: '/stats' 
    },
    { 
      icon: <FaHistory />, 
      label: 'History', 
      path: '/history' 
    }
  ];

  const systemItems = [
    { 
      icon: <FaBell />, 
      label: `Notifications ${unreadCount > 0 ? `(${unreadCount})` : ''}`, 
      path: '/notifications',
      badge: unreadCount > 0
    },
    { 
      icon: <FaCog />, 
      label: 'Settings', 
      path: '/settings' 
    },
    { 
      icon: <FaQuestionCircle />, 
      label: 'Help Center', 
      path: '/help' 
    }
  ];

  if (!showDropdown) return null;

  return (
    <div className="navbar-dropdown" ref={dropdownRef} role="menu">
      {/* User info at the top */}
      <div className="dropdown-user-info">
        <div className="dropdown-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={`${user.username}'s avatar`} />
          ) : (
            <FaUserCircle className="dropdown-avatar-fallback" />
          )}
        </div>
        <div className="dropdown-user-details">
          <span className="dropdown-username">{user.username || 'User'}</span>
          <span className="dropdown-email">{user.email || ''}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="dropdown-divider"></div>

      {/* Account group */}
      <div className="dropdown-group">
        <div className="dropdown-group-title">Account</div>
        {accountItems.map((item, index) => (
          <Link
            key={`account-${index}`}
            to={item.path}
            className="dropdown-item"
            onClick={closeDropdown}
            role="menuitem"
          >
            <span className="dropdown-icon">{item.icon}</span>
            <span className="dropdown-label">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* System group */}
      <div className="dropdown-group">
        <div className="dropdown-group-title">System</div>
        {systemItems.map((item, index) => (
          <Link
            key={`system-${index}`}
            to={item.path}
            className="dropdown-item"
            onClick={closeDropdown}
            role="menuitem"
          >
            <span className="dropdown-icon">{item.icon}</span>
            <span className="dropdown-label">{item.label}</span>
            {item.badge && <span className="dropdown-badge">{unreadCount}</span>}
          </Link>
        ))}
      </div>

      {/* Logout at the bottom */}
      <button 
        onClick={() => { handleLogout(); closeDropdown(); }} 
        className="dropdown-item logout" 
        role="menuitem"
      >
        <span className="dropdown-icon"><FaSignOutAlt /></span>
        <span className="dropdown-label">Logout</span>
      </button>
    </div>
  );
};

export default NavbarDropdown;