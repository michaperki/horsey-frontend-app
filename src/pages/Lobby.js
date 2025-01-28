// src/pages/Lobby.js

import React, { useState } from "react";
import AvailableBets from "../components/AvailableBets";
import './Lobby.css'; // Styles specific to Lobby

const Lobby = () => {
  const [activeTab, setActiveTab] = useState("tab-1v1"); // Default to tab-1v1

  const handleTabClick = (tab) => {
    if (tab !== "tab-1v1") {
      // Optionally, prevent switching to unimplemented tabs
      // alert(`${tab} feature is coming soon!`);
      // return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="lobby-container">
      <div className="tabs">
        {["tab-1v1", "tab-sit-and-go", "tab-tournament"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            disabled={tab !== "tab-1v1"} // Disable buttons for unimplemented features
          >
            {tab.replace('tab-', '').replace('-', ' ')}
          </button>
        ))}
        <div className={`tab-underline ${activeTab}`}></div>
      </div>
      
      {/* Conditional Rendering Based on Active Tab */}
      {activeTab === "tab-1v1" && <AvailableBets format="1v1" />}
      {activeTab === "tab-sit-and-go" && (
        <div style={styles.placeholder}>
          <p>🌟 Sit and Go feature is coming soon! Stay tuned. 🌟</p>
        </div>
      )}
      {activeTab === "tab-tournament" && (
        <div style={styles.placeholder}>
          <p>🏆 Tournament feature is coming soon! Stay tuned. 🏆</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  placeholder: {
    padding: "20px",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
    textAlign: "center",
    marginTop: "20px",
    fontStyle: "italic",
    color: "#555",
  },
};

export default Lobby;
