
// src/components/Layout.js

import React from 'react';
import Navbar from './Navbar'; // Import Navbar
import Bulletin from './Bulletin'; // Left sidebar
import Sidebar from './Sidebar'; // Right sidebar
import Play1v1Button from './Play1v1Button';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-container">
      {/* Navbar at the top */}
      <Navbar />
      
      <div className="layout-content">
        {/* Left Sidebar */}
        <aside className="bulletin">
          <Bulletin />
        </aside>
        
        {/* Main Content */}
        <main className="main-content">
          <Outlet />
        </main>
        
        {/* Right Sidebar */}
        <aside className="sidebar">
          <Sidebar />
          <div className="play1v1-button-container">
            <Play1v1Button />
          </div>
        </aside>
      </div>
      
      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default Layout;

