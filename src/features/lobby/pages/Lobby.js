// src/pages/Lobby.js

import React, { useState } from "react";
import AvailableBets from "../../betting/components/AvailableBets";
import './Lobby.css';
import UserGreetingInfo from '../../profile/components/UserGreetingInfo';
import { useLichess } from '../../auth/contexts/LichessContext';
import { useProfile } from '../../profile/contexts/ProfileContext';

const Lobby = () => {
  const { lichessConnected, lichessUsername } = useLichess();
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState("tab-1v1");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="lobby-container">
      <UserGreetingInfo
        lichessConnected={lichessConnected}
        lichessUsername={lichessUsername}
        statistics={profile}
      />

      <div className="tabs">
        {["tab-1v1", "tab-sit-and-go", "tab-tournament"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            disabled={tab !== "tab-1v1"}
          >
            {tab.replace('tab-', '').replace('-', ' ')}
          </button>
        ))}
        <div className={`tab-underline ${activeTab}`}></div>
      </div>
      
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
