
// src/components/Layout.js

import React from 'react';
import Bulletin from './Bulletin'; // New Bulletin component
import Sidebar from './Sidebar'; // Right sidebar
import Play1v1Button from './Play1v1Button';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-container">
      <div className="layout-content">
        {/* Left Sidebar transformed to Bulletin */}
        <aside className="bulletin">
          <Bulletin />
        </aside>
        
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
      <Footer />
    </div>
  );
};

export default Layout;
