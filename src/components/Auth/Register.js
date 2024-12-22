
// frontend/src/components/Auth/Register.js
import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const { username, email, password } = formData;

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Registration successful. You can now log in.');
        setFormData({ username: '', email: '', password: '' });
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Register</h2>
      <input type="text" name="username" placeholder="Username" value={username} onChange={handleChange} style={styles.input} />
      <input type="email" name="email" placeholder="Email" value={email} onChange={handleChange} style={styles.input} />
      <input type="password" name="password" placeholder="Password" value={password} onChange={handleChange} style={styles.input} />
      <button type="submit" onClick={handleRegister} style={styles.button}>Register</button>
      {message && <p>{message}</p>}
    </div>
  );
};

const styles = {
  container: { /* Your styling here */ },
  input: { /* Your styling here */ },
  button: { /* Your styling here */ },
};

export default Register;
