
// frontend/src/components/Auth/Logout.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login'); // Ensure this path is `/login`
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
