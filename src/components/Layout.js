
// src/components/Layout.js

import React from 'react';
import Navbar from './Navbar'; // Import Navbar
import Bulletin from './Bulletin'; // Left sidebar
import Sidebar from './Sidebar'; // Right sidebar
import PlaceBet from './PlaceBet';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-container">
      {/* Navbar at the top */}
      <Navbar />
      
      <div className="app-wrapper">
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
            <div className="placebet-button-container">
              <PlaceBet />
            </div>
          </aside>
        </div>
      </div>
      
      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default Layout;

