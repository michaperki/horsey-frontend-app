
// src/components/Auth/Logout.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Destructure logout from AuthContext

  const handleLogout = () => {
    logout(); // Use logout from AuthContext
    navigate('/login'); // Redirect to login
  };

  return <button onClick={handleLogout} style={styles.button}>Logout</button>;
};

const styles = {
  button: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default Logout;

