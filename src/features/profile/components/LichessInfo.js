
// src/components/LichessInfo.js

import React from 'react';
import PropTypes from 'prop-types';
import { formatDate } from 'features/common/utils/formatDate'; // Import the utility function

const LichessInfo = ({ info }) => {
  const connectedDate = formatDate(info.connectedAt);

  // Access standard and variant ratings
  const standardRatings = (info.ratings && info.ratings.standard) || {};
  const variantRatings = (info.ratings && info.ratings.variants) || {};

  return (
    <div style={styles.container}>
      <p>
        <strong>Username:</strong> {info.username}
      </p>
      <p>
        <strong>Connected Since:</strong>{" "}
        <span data-testid="connected-date">{connectedDate}</span>
      </p>

      {/* Display Standard Ratings */}
      <div style={styles.ratingsContainer}>
        <h4>Standard Ratings:</h4>
        {Object.keys(standardRatings).length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Game Type</th>
                <th style={styles.th}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(standardRatings).map(([gameType, rating]) => (
                <tr
                  key={gameType}
                  style={gameType === 'classical' ? styles.highlightRow : {}}
                >
                  <td style={styles.td}>{capitalizeFirstLetter(gameType)}</td>
                  <td style={styles.td}>{rating !== null ? rating : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No standard ratings available.</p>
        )}
      </div>

      {/* Display Variant Ratings */}
      <div style={styles.ratingsContainer}>
        <h4>Variant Ratings:</h4>
        {Object.keys(variantRatings).length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Variant</th>
                <th style={styles.th}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(variantRatings).map(([variant, rating]) => (
                <tr key={variant} style={styles.highlightRow}>
                  <td style={styles.td}>{capitalizeFirstLetter(variant)}</td>
                  <td style={styles.td}>{rating !== null ? rating : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No variant ratings available.</p>
        )}
      </div>
    </div>
  );
};

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

LichessInfo.propTypes = {
  info: PropTypes.shape({
    username: PropTypes.string.isRequired,
    connectedAt: PropTypes.string,
    ratings: PropTypes.shape({
      standard: PropTypes.objectOf(PropTypes.number),
      variants: PropTypes.objectOf(PropTypes.number),
    }),
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
  error: {
    color: 'red',
  },
};

export default LichessInfo;

