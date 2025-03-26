// src/features/layout/components/Layout.js

import React from 'react';
import Navbar from './Navbar'; // Same directory
import Bulletin from './Bulletin'; // Same directory
import Sidebar from './Sidebar'; // Same directory
import PlaceBet from '../../betting/components/PlaceBet'; // Updated path
import Footer from './Footer'; // Same directory
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

