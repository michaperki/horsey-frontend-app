
// src/components/Play1v1Button.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Play1v1Button.css'; // Styles specific to Play1v1Button

const Play1v1Button = () => {
  const navigate = useNavigate();

  const handlePlay1v1 = () => {
    navigate('/place-bet'); // Navigate to the PlaceBet page or appropriate route
  };

  return (
    <div className="play-1v1-button">
      <button
        className="button"
        onClick={handlePlay1v1}
      >
        Play 1v1
      </button>
    </div>
  );
};

export default Play1v1Button;
