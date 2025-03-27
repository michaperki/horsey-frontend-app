// src/features/info/layout/InfoLayout.js

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChessKnight } from 'react-icons/fa';
import '../pages/InfoPages.css';

const InfoLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="info-layout">
      <div className="info-navigation">
        <button 
          className="back-button" 
          onClick={() => navigate(-1)}
        >
          <FaChevronLeft /> Back
        </button>
        <div className="logo">
          <FaChessKnight /> Horsey
        </div>
      </div>
      
      {/* This is where the child routes will be rendered */}
      <Outlet />
    </div>
  );
};

export default InfoLayout;