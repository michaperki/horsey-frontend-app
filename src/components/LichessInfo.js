
// src/components/LichessInfo.js

import React from 'react';

const LichessInfo = ({ info }) => {
  return (
    <div style={styles.container}>
      <p><strong>Username:</strong> {info.username}</p>
      <p><strong>Rating:</strong> {info.rating}</p>
      {/* Add more Lichess-related information as needed */}
      <p><strong>Connected Since:</strong> {new Date(info.connectedAt).toLocaleString()}</p>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    display: "inline-block",
    textAlign: "left",
  },
};

export default LichessInfo;
