// frontend/src/components/Auth/UserLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setMessage('Login successful.');
        navigate('/dashboard'); // Redirect to user dashboard
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>User Login</h2>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={email}
        onChange={handleChange}
        style={styles.input}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={password}
        onChange={handleChange}
        style={styles.input}
      />
      <button onClick={handleLogin} style={styles.button}>Login</button>
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
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default UserLogin;