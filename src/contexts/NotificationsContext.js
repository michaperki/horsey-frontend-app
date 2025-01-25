
// frontend/src/contexts/NotificationsContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { apiFetch } from '../utils/api'; // Use your custom apiFetch
import { useAuth } from './AuthContext';

const NotificationsContext = createContext();

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (token && user) {
        try {
          const data = await apiFetch('/notifications', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: { read: false }, // Use query params if supported
          });
          setNotifications(data.notifications);
          setUnreadCount(data.total);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token, user]);

  // Setup Socket.io connection
  useEffect(() => {
    if (token && user) {
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || '/', {
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log('Connected to Socket.io server');
      });

      newSocket.on('notification', (notification) => {
        console.log('Received notification:', notification);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from Socket.io server');
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket.io connection error:', err.message);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token, user]);

  const markAsRead = async (notificationId) => {
    try {
      await apiFetch(`/notifications/${notificationId}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        loading,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
