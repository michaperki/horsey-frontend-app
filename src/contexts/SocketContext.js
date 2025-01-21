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
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Initialize Socket.io client with enhanced options
    socketRef.current = io(process.env.REACT_APP_API_URL, {
      auth: { token },
      reconnectionAttempts: 5, // Customize as needed
      reconnectionDelay: 1000,  // Customize as needed
    });

    const currentSocket = socketRef.current;

    currentSocket.on('connect', () => {
      console.log('Connected to Socket.io server');
    });

    currentSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    currentSocket.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
    });

    currentSocket.on('reconnect_failed', () => {
      console.error('Reconnection failed');
    });

    return () => {
      if (currentSocket) {
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
