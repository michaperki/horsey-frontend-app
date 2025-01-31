
// src/contexts/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Always connect—if token exists, include it; otherwise, connect as guest.
    const auth = token ? { token } : {};

    // Disconnect any existing socket
    if (socket) {
      socket.disconnect();
    }

    console.log('Attempting to connect to Socket.io server', token ? 'with token' : 'as guest');
    const socketInstance = io(process.env.REACT_APP_API_URL, {
      auth,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000,
    });
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log(`Socket.io connected: ID=${socketInstance.id}`);
      // Request live stats on connection
      socketInstance.emit('getLiveStats');
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket.io connection error:', err.message);
      console.error('Error details:', err);
    });

    socketInstance.on('connect_timeout', () => {
      console.warn('Socket.io connection timed out.');
    });

    socketInstance.on('reconnect_attempt', (attempt) => {
      console.log(`Socket.io reconnection attempt ${attempt}`);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('Socket.io reconnection failed after maximum attempts.');
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn(`Socket.io disconnected: ${reason}`);
      if (reason === 'io server disconnect') {
        socketInstance.connect();
      }
    });

    socketInstance.on('error', (error) => {
      console.error('Socket.io encountered an error:', error);
    });

    return () => {
      if (socketInstance) {
        console.log('Disconnecting Socket.io client.');
        socketInstance.disconnect();
      }
    };
  }, [token]); // Re-run when token changes

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SocketContext;

