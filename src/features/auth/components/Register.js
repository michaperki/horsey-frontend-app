// src/features/auth/components/Register.js

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { register } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserPlus, FaEnvelope, FaLock, FaUser, FaChessKnight } from 'react-icons/fa';
import './Auth.css';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const { username, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Check if passwords match when either password field changes
    if (name === 'password' || name === 'confirmPassword') {
      if (name === 'password') {
        setPasswordsMatch(value === confirmPassword);
      } else {
        setPasswordsMatch(value === password);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Remove confirmPassword as it's not needed for the API call
      const { confirmPassword, ...registrationData } = formData;
      const data = await register(registrationData);

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
      setError(err.message || 'Registration failed. Please try again.');
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

        <form onSubmit={handleRegister} className="auth-form">
          <motion.div 
            className="form-group"
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
          </motion.div>

          <motion.div 
            className="form-group"
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
          </motion.div>

          <motion.div 
            className="form-group"
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
          </motion.div>

          <motion.div 
            className="form-group"
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
              className={`form-input ${!passwordsMatch && confirmPassword ? 'input-error' : ''}`}
              required
            />
            {!passwordsMatch && confirmPassword && (
              <p className="error-message">Passwords do not match</p>
            )}
          </motion.div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <motion.button 
            type="submit" 
            className="auth-button"
            disabled={loading || (confirmPassword && !passwordsMatch)}
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
