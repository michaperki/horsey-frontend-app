
import React, { useState } from "react";
import AvailableBets from "../components/AvailableBets";

const Lobby = () => {
  const [activeTab, setActiveTab] = useState("1v1"); // Default to 1v1

  const handleTabClick = (tab) => setActiveTab(tab);

  return (
    <div>
      <h1>Lobby</h1>
      <div style={styles.tabs}>
        {["1v1", "Sit and Go", "Tournament"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.activeTab : {}),
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <AvailableBets format={activeTab} />
    </div>
  );
};

const styles = {
  tabs: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  tab: {
    padding: "10px 20px",
    border: "none",
    borderBottom: "2px solid transparent",
    background: "none",
    fontSize: "16px",
    cursor: "pointer",
  },
  activeTab: {
    borderBottom: "2px solid #007bff",
    fontWeight: "bold",
  },
};

export default Lobby;

