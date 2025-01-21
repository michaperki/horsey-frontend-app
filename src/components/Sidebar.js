
import React from 'react';
import './Sidebar.css'; // Styles for the sidebar

const Sidebar = () => {
  return (
    <div className="sidebar-container">
      {/* Example content: Replace with your actual content */}
      <img src="/assets/sidebar.jpg" alt="Sidebar Ad" className="sidebar-image" />
      <div className="sidebar-info">
        <h3>Welcome!</h3>
        <p>Here is some important information or an advertisement.</p>
      </div>
    </div>
  );
};

export default Sidebar;
