// src/features/auth/components/UserLogin.js - Updated with Error Handling

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as loginUser } from '../services/api';
import { FaSignInAlt, FaEnvelope, FaLock } from 'react-icons/fa';
import { FormError } from '../../common/components/FormError';
import { ApiError } from '../../common/components/ApiError';
import { useApiError } from '../../common/contexts/ApiErrorContext';
import './Auth.css';

const UserLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, token } = useAuth();
  const { handleApiError } = useApiError();

  // Check if user is already logged in
  useEffect(() => {
    if (token) {
      navigate('/home');
    }
  }, [token, navigate]);

  const { email, password } = formData;

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    
    // Simple email validation
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear field-specific errors when user types
    if (formErrors[e.target.name]) {
      const { [e.target.name]: _, ...rest } = formErrors;
      setFormErrors(rest);
    }
    
    // Clear any general error messages when user types
    if (error) setError(null);
    if (message) setMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate form first
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage('');
    setError(null);
    
    try {
      // Use handleApiError to wrap the API call
      const loginWithHandling = handleApiError(loginUser, {
        showGlobalError: false, // We'll handle errors in the form
        onError: (err) => setError(err)
      });
      
      const token = await loginWithHandling({ email, password });
      
      if (token) {
        login(token);
        setMessage('Login successful. Redirecting...');
        navigate('/home');
      } else {
        setError({
          code: 'LOGIN_FAILED',
          message: 'Login failed. Please try again.'
        });
      }
    } catch (error) {
      // Error is handled by handleApiError
      console.error('Login error:', error);
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
          <h2 className="auth-subtitle">Welcome Back</h2>
        </div>

        {/* Display API errors */}
        {error && (
          <div className="auth-error-container">
            <ApiError 
              error={error} 
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <motion.div 
            className={`form-group ${formErrors.email ? 'has-error' : ''}`}
            variants={itemVariants}
          >
            <label htmlFor="email" className="form-label">
              <FaEnvelope className="input-icon" />
              <span>Email</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleChange}
              className="form-input"
              required
              autoFocus
            />
            <FormError error={formErrors} field="email" />
          </motion.div>

          <motion.div 
            className={`form-group ${formErrors.password ? 'has-error' : ''}`}
            variants={itemVariants}
          >
            <label htmlFor="password" className="form-label">
              <FaLock className="input-icon" />
              <span>Password</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={handleChange}
              className="form-input"
              required
            />
            <FormError error={formErrors} field="password" />
          </motion.div>

          {message && <div className="success-message">{message}</div>}

          <motion.div 
            className="form-options"
            variants={itemVariants}
          >
            <div className="remember-me">
              <input type="checkbox" id="remember" name="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/forgot-password" className="auth-link forgot-password">
              Forgot Password?
            </Link>
          </motion.div>

          <motion.button 
            type="submit" 
            className="auth-button"
            disabled={loading}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="button-content">
                <span className="loading-spinner"></span>
                Logging in...
              </span>
            ) : (
              <span className="button-content">
                <FaSignInAlt className="button-icon" />
                Login
              </span>
            )}
          </motion.button>
        </form>

        <motion.div 
          className="auth-footer"
          variants={itemVariants}
        >
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign up here
            </Link>
          </p>
          
          {/* For future implementation */}
          <div className="social-login">
            <p className="social-login-text">Or login with</p>
            <div className="social-login-buttons">
              <button 
                className="social-button lichess-button"
                onClick={() => {
                  // To be implemented with lichess OAuth
                  console.log("Lichess login to be implemented");
                }}
              >
                <img src="/assets/lichess-icon.png" alt="Lichess" className="social-icon" />
                Lichess
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default UserLogin;
