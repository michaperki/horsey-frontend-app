
// src/contexts/SocketContext.js

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        console.log('No token available. Disconnecting existing socket.');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    console.log('Attempting to connect to Socket.io server with token.');

    // Initialize Socket.io client with enhanced options
    socketRef.current = io(process.env.REACT_APP_API_URL, {
      auth: { token },
      reconnectionAttempts: 5, // Customize as needed
      reconnectionDelay: 1000,  // Customize as needed
      timeout: 5000, // Connection timeout
    });

    const currentSocket = socketRef.current;

    currentSocket.on('connect', () => {
      console.log(`Socket.io connected: ID=${currentSocket.id}`);
    });

    currentSocket.on('connect_error', (err) => {
      console.error('Socket.io connection error:', err.message);
      console.error('Error details:', err);
    });

    currentSocket.on('connect_timeout', () => {
      console.warn('Socket.io connection timed out.');
    });

    currentSocket.on('reconnect_attempt', (attempt) => {
      console.log(`Socket.io reconnection attempt ${attempt}`);
    });

    currentSocket.on('reconnect_failed', () => {
      console.error('Socket.io reconnection failed after maximum attempts.');
    });

    currentSocket.on('disconnect', (reason) => {
      console.warn(`Socket.io disconnected: ${reason}`);
      if (reason === 'io server disconnect') {
        // The disconnection was initiated by the server, you need to reconnect manually
        currentSocket.connect();
      }
    });

    currentSocket.on('error', (error) => {
      console.error('Socket.io encountered an error:', error);
    });

    // Optionally, listen to any custom events for additional debugging
    currentSocket.on('notification', (data) => {
      console.log('Received notification:', data);
    });

    return () => {
      if (currentSocket) {
        console.log('Disconnecting Socket.io client.');
        currentSocket.disconnect();
      }
    };
  }, [token]); // Dependency only on 'token'

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

