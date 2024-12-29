
// src/components/Auth/AdminLogin.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Destructure login from AuthContext

  const { email, password } = formData;

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const response = await fetch('/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage(error.error || 'Admin login failed.');
        return;
      }

      const data = await response.json();

      if (data.token) {
        login(data.token); // Use login from AuthContext
        setMessage('Admin login successful.');
        navigate('/admin/dashboard'); // Redirect to admin dashboard
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Admin Email"
          value={email}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Admin Password"
          value={password}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Login as Admin</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "400px",
    margin: "auto",
    backgroundColor: "#f1f1f1",
    borderRadius: "8px",
    marginTop: "50px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default AdminLogin;

