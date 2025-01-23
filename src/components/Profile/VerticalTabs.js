
// src/components/Profile/VerticalTabs.js

import React from 'react';
import './VerticalTabs.css';

const tabs = ['Overview', 'Ratings', 'History', 'Items', 'Friends', 'Account'];

const VerticalTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="vertical-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default VerticalTabs;
