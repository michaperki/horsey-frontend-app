
// src/components/LichessInfo.js

import React from 'react';

const LichessInfo = ({ info }) => {
  const connectedDate = info.connectedAt ? new Date(info.connectedAt).toISOString() : "N/A";
  
  return (
    <div style={styles.container}>
      <p>
        <strong>Username:</strong> {info.username}
      </p>
      <p>
        <strong>Rating:</strong> {info.rating}
      </p>
      <p>
        <strong>Connected Since:</strong>{" "}
        <span data-testid="connected-date">
          {connectedDate}
        </span>
      </p>
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

