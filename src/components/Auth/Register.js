// src/components/Auth/Register.js

import React, { useState } from 'react';
import { register } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth for logging in after registration
import { useNavigate, Link } from 'react-router-dom'; // Import useNavigate and Link

const Register = () => {
  const { login } = useAuth(); // Use the login function from AuthContext
  const navigate = useNavigate(); // Hook for navigation

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // State to manage loading
  const [error, setError] = useState(''); // State to manage errors

  const { username, email, password } = formData;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await register(formData);

      if (data.token) {
        // If the API returns a token upon successful registration
        login(data.token); // Log the user in
        navigate('/dashboard'); // Redirect to dashboard or desired page
      } else {
        // If no token is returned, just show a success message
        setMessage(
          <span>
            Registration successful. You can now{' '}
            <Link to="/login" style={styles.link}>
              log in
            </Link>
            .
          </span>
        );
        setFormData({ username: '', email: '', password: '' });
      }
    } catch (err) {
      // Handle errors returned from the API
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={handleChange}
          style={styles.input}
          required
        />
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
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
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
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default Register;
