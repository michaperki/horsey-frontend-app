
// src/components/Profile/VerticalTabs.js

import React from 'react';
import PropTypes from 'prop-types';
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

VerticalTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default VerticalTabs;
