// src/features/auth/components/Register.js - Updated with Error Handling

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { register } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserPlus, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { FormError } from '../../common/components/FormError';
import { ApiError } from '../../common/components/ApiError';
import { useApiError } from '../../common/contexts/ApiErrorContext';
import './Auth.css';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { handleApiError } = useApiError();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const { username, email, password, confirmPassword } = formData;

  // Validate the form
  const validateForm = () => {
    const errors = {};
    
    // Username validation
    if (!username) errors.username = 'Username is required';
    else if (username.length < 3) 
      errors.username = 'Username must be at least 3 characters';
    
    // Email validation
    if (!email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) 
      errors.email = 'Please enter a valid email address';
    
    // Password validation
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) 
      errors.password = 'Password must be at least 6 characters';
    
    // Confirm password validation
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (confirmPassword !== password) 
      errors.confirmPassword = 'Passwords do not match';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear field-specific errors when user types
    if (formErrors[name]) {
      const { [name]: _, ...rest } = formErrors;
      setFormErrors(rest);
    }
    
    // Clear any API errors when user types
    if (error) setError(null);
    if (message) setMessage('');
    
    // Additional password matching check for immediate feedback
    if (name === 'password' || name === 'confirmPassword') {
      const otherField = name === 'password' ? 'confirmPassword' : 'password';
      const otherValue = formData[otherField];
      
      if (otherValue && value !== otherValue) {
        setFormErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      } else if (otherValue && value === otherValue) {
        // Clear password match error if they now match
        const { confirmPassword, ...rest } = formErrors;
        setFormErrors(rest);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate form first
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    setMessage('');

    try {
      // Use handleApiError wrapper for error handling
      const registerWithHandling = handleApiError(register, {
        showGlobalError: false,
        onError: (err) => {
          // Special handling for validation errors from the server
          if (err.code === 'VALIDATION_ERROR' && err.validationErrors) {
            setFormErrors({
              ...formErrors,
              ...err.validationErrors
            });
          } else {
            setError(err);
          }
        }
      });
      
      // Remove confirmPassword as it's not needed for the API call
      const { confirmPassword, ...registrationData } = formData;
      const data = await registerWithHandling(registrationData);

      if (data.token) {
        login(data.token);
        navigate('/home');
      } else {
        setMessage(
          <span>
            Registration successful. You can now{' '}
            <Link to="/login" className="auth-link">
              log in
            </Link>
            .
          </span>
        );
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (err) {
      // Errors are handled by handleApiError
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
          <h2 className="auth-subtitle">Create Account</h2>
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

        <form onSubmit={handleRegister} className="auth-form">
          <motion.div 
            className={`form-group ${formErrors.username ? 'has-error' : ''}`}
            variants={itemVariants}
          >
            <label htmlFor="username" className="form-label">
              <FaUser className="input-icon" />
              <span>Username</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Choose a username"
              value={username}
              onChange={handleChange}
              className="form-input"
              required
            />
            <FormError error={formErrors} field="username" />
          </motion.div>

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
              placeholder="Create a password"
              value={password}
              onChange={handleChange}
              className="form-input"
              required
            />
            <FormError error={formErrors} field="password" />
          </motion.div>

          <motion.div 
            className={`form-group ${formErrors.confirmPassword ? 'has-error' : ''}`}
            variants={itemVariants}
          >
            <label htmlFor="confirmPassword" className="form-label">
              <FaLock className="input-icon" />
              <span>Confirm Password</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={handleChange}
              className="form-input"
              required
            />
            <FormError error={formErrors} field="confirmPassword" />
          </motion.div>

          {message && <div className="success-message">{message}</div>}

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
                Processing...
              </span>
            ) : (
              <span className="button-content">
                <FaUserPlus className="button-icon" />
                Register
              </span>
            )}
          </motion.button>
        </form>

        <motion.div 
          className="auth-footer"
          variants={itemVariants}
        >
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Log in here
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Register;
