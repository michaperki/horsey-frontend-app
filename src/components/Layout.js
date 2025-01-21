
// src/components/Layout.js
import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-container">
      <div className="layout-content">
        <aside className="sidebar">
          <Sidebar />
        </aside>
        
        <main className="main-content">
          <Outlet />
        </main>
        
        <aside className="sidebar">
          <Sidebar />
        </aside>
      </div>
    </div>
  );
};

export default Layout;

