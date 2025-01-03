// src/components/LichessInfo.js

import React from 'react';
import PropTypes from 'prop-types';

const LichessInfo = ({ info }) => {
  const connectedDate = info.connectedAt ? new Date(info.connectedAt).toLocaleString() : "N/A";

  // Extract ratings from lichessRatings object
  const ratings = info.ratings || {};

  return (
    <div style={styles.container}>
      <p>
        <strong>Username:</strong> {info.username}
      </p>
      <p>
        <strong>Connected Since:</strong>{" "}
        <span data-testid="connected-date">
          {connectedDate}
        </span>
      </p>
      
      {/* Display Ratings */}
      <div style={styles.ratingsContainer}>
        <h4>Ratings:</h4>
        {Object.keys(ratings).length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Game Type</th>
                <th style={styles.th}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(ratings).map(([gameType, rating]) => (
                <tr key={gameType} style={gameType === 'classical' ? styles.highlightRow : {}}>
                  <td style={styles.td}>{capitalizeFirstLetter(gameType)}</td>
                  <td style={styles.td}>{rating !== null ? rating : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No ratings available.</p>
        )}
      </div>
    </div>
  );
};

// Helper function to capitalize game type names
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

LichessInfo.propTypes = {
  info: PropTypes.shape({
    username: PropTypes.string.isRequired,
    connectedAt: PropTypes.string,
    ratings: PropTypes.objectOf(
      PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.oneOf([null]),
      ])
    ),
  }).isRequired,
};

const styles = {
  container: {
    backgroundColor: "#f0f8ff",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #add8e6",
    display: "inline-block",
    textAlign: "left",
    marginTop: "10px",
    width: "100%", // Ensure table fits within container
  },
  ratingsContainer: {
    marginTop: "15px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    overflowX: "auto",
    display: "block",
  },
  th: {
    border: "1px solid #ddd",
    padding: "8px",
    backgroundColor: "#f2f2f2",
    textAlign: "left",
  },
  td: {
    border: "1px solid #ddd",
    padding: "8px",
  },
  highlightRow: {
    backgroundColor: '#d1e7dd', // Light green background for primary rating
  },
};

export default LichessInfo;
