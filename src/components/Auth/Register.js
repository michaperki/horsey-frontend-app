
// src/components/Auth/Register.js

import React, { useState } from 'react';
// import { useAuth } from '../../contexts/AuthContext'; // Import useAuth if needed

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  // const { login } = useAuth(); // Uncomment if you want to log in after registration

  const { username, email, password } = formData;

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Registration successful. You can now log in.');
        setFormData({ username: '', email: '', password: '' });
        // Optionally, log the user in immediately:
        // if (data.token) {
        //   login(data.token);
        //   navigate('/dashboard');
        // }
      } else {
        setMessage(data.error || 'Registration failed.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('An unexpected error occurred.');
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
        <button type="submit" style={styles.button}>Register</button>
      </form>
      {message && <p>{message}</p>}
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
};

export default Register;

