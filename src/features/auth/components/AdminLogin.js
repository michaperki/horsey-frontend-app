// src/features/auth/components/AdminLogin.js

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEnvelope, FaLock, FaShieldAlt, FaLockOpen } from 'react-icons/fa';
import './Auth.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, token, user } = useAuth();

  // Check if admin is already logged in
  useEffect(() => {
    if (token && user?.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [token, user, navigate]);

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear any error messages when user types
    if (error) setError('');
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Admin login failed.');
      }

      const data = await response.json();

      if (data.token) {
        login(data.token);
        setMessage('Admin login successful. Redirecting to dashboard...');
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50, damping: 10 }
    }
  };

  return (
    <motion.div 
      className="auth-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="auth-card"
        variants={itemVariants}
      >
        <div className="auth-header">
          <div className="logo-container">
            <img src="/assets/logo.png" alt="Horsey Logo" className="auth-logo" />
            <h1 className="auth-title">HORSEY</h1>
          </div>
          <h2 className="auth-subtitle">
            <FaShieldAlt style={{ marginRight: '8px' }} />
            Admin Login
          </h2>
          <p className="auth-description">
            Secure access for authorized administrators only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label htmlFor="email" className="form-label">
              <FaEnvelope className="input-icon" />
              <span>Admin Email</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your admin email"
              value={email}
              onChange={handleChange}
              className="form-input"
              required
              autoFocus
            />
          </motion.div>

          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label htmlFor="password" className="form-label">
              <FaLock className="input-icon" />
              <span>Admin Password</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your admin password"
              value={password}
              onChange={handleChange}
              className="form-input"
              required
            />
          </motion.div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <motion.button 
            type="submit" 
            className="auth-button"
            disabled={loading}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              background: 'linear-gradient(135deg, #2c3e50 0%, #1a2533 100%)'
            }}
          >
            {loading ? (
              <span className="button-content">
                <span className="loading-spinner"></span>
                Authenticating...
              </span>
            ) : (
              <span className="button-content">
                <FaLockOpen className="button-icon" />
                Login as Admin
              </span>
            )}
          </motion.button>
        </form>

        <motion.div 
          className="auth-footer"
          variants={itemVariants}
        >
          <p>
            Not an administrator?{' '}
            <a href="/login" className="auth-link">
              Return to user login
            </a>
          </p>
          
          <div className="admin-footer-note">
            <FaShieldAlt style={{ marginRight: '5px', fontSize: '12px' }} />
            <span>Administrative access is restricted to authorized personnel only.</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AdminLogin;
