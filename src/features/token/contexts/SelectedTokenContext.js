
import React, { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes

/**
 * Context to manage the selected token state across the application.
 */
const SelectedTokenContext = createContext();

/**
 * Provider component to wrap around parts of the app that need access to the selected token.
 */
export const SelectedTokenProvider = ({ children }) => {
  const [selectedToken, setSelectedToken] = useState('token'); // Default to 'token'

  /**
   * Function to update the selected token.
   * @param {string} token - The token to select ('token' or 'sweepstakes').
   */
  const updateSelectedToken = (token) => {
    setSelectedToken(token);
  };

  return (
    <SelectedTokenContext.Provider value={{ selectedToken, updateSelectedToken }}>
      {children}
    </SelectedTokenContext.Provider>
  );
};

// Add PropTypes validation
SelectedTokenProvider.propTypes = {
  children: PropTypes.node.isRequired, // children should be a React node and required
};

/**
 * Custom hook to use the SelectedTokenContext.
 * @returns {object} - The context value containing selectedToken and updateSelectedToken.
 */
export const useSelectedToken = () => useContext(SelectedTokenContext);

