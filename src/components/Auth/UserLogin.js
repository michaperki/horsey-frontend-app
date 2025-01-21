// src/components/Auth/UserLogin.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { loginUser } from '../../services/api'; // Import the loginUser function

const UserLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Destructure login from AuthContext

  const { email, password } = formData;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form behavior
    setMessage(''); // Clear previous messages
    try {
      const token = await loginUser({ email, password });
      if (token) {
        login(token); // Use login from AuthContext
        setMessage('Login successful.');
        navigate('/home'); // Redirect to user dashboard
      } else {
        setMessage('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage(error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <form onSubmit={handleLogin} style={styles.container}>
      <h2>User Login</h2>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={email}
        onChange={handleChange}
        style={styles.input}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={password}
        onChange={handleChange}
        style={styles.input}
        required
      />
      <button type="submit" style={styles.button}>Login</button>
      {message && <p>{message}</p>}
    </form>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '400px',
    margin: 'auto',
    backgroundColor: '#f1f1f1',
    borderRadius: '8px',
    marginTop: '50px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default UserLogin;
