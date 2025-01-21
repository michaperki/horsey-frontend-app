
import React, { useState } from "react";
import AvailableBets from "../components/AvailableBets";
import './Lobby.css'; // Styles specific to Lobby

const Lobby = () => {
  const [activeTab, setActiveTab] = useState("1v1"); // Default to 1v1

  const handleTabClick = (tab) => setActiveTab(tab);

  return (
    <div className="lobby-container">
      <h1>Lobby</h1>
      <div className="tabs">
        {["1v1", "Sit and Go", "Tournament"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
        <div className={`tab-underline ${activeTab}`}></div>
      </div>
      <AvailableBets format={activeTab} />
    </div>
  );
};

export default Lobby;

