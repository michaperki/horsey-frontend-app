
// frontend/src/pages/Home.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Ensure this is correctly imported

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Invalid token:', err);
        // Optionally, you can clear the invalid token
        localStorage.removeItem('token');
      }
    }
  }, [navigate]);

  return (
    <div style={styles.container}>
      <h1>Welcome to Chess Betting Platform</h1>
      <p>Please sign up or log in to continue.</p>
      {/* Add any additional public information or marketing text here */}
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '50px',
  },
};

export default Home;

