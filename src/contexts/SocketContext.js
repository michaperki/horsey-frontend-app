
// frontend/src/contexts/SocketContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext'; // Ensure AuthContext provides the JWT token

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const { token } = useAuth(); // Get the JWT token from AuthContext
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;

    // Initialize Socket.io client
    const newSocket = io(process.env.REACT_APP_BACKEND_URL, {
      auth: { token }, // Send the JWT token for authentication
      transports: ['websocket'], // Use WebSocket transport
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Socket.io server');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

