// src/__mocks__/socket-context.js
import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  // Create a mock socket instance with all the methods used in your app
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    id: 'mock-socket-id',
  };

  return (
    <SocketContext.Provider value={mockSocket}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SocketContext;