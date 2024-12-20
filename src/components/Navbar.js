
// frontend/src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
  const token = localStorage.getItem('token');
  let user = null;

  if (token) {
    try {
      user = jwtDecode(token);
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/'; // Redirect to home
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.link}>Home</Link>
      {user && user.role === 'user' && (
        <>
          <Link to="/dashboard" style={styles.link}>Dashboard</Link>
          <Link to="/profile" style={styles.link}>Profile</Link>
          <Link to="/notifications" style={styles.link}>Notifications</Link>
          <button onClick={handleLogout} style={styles.button}>Logout</button>
        </>
      )}
      {user && user.role === 'admin' && (
        <>
          <Link to="/admin/dashboard" style={styles.link}>Admin Dashboard</Link>
          <button onClick={handleLogout} style={styles.button}>Logout</button>
        </>
      )}
      {!user && (
        <>
          <Link to="/login" style={styles.link}>User Login</Link>
          <Link to="/register" style={styles.link}>Register</Link>
          <Link to="/admin/login" style={styles.link}>Admin Login</Link>
        </>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "#343a40",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    padding: "0 10px",
  },
  button: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Navbar;

