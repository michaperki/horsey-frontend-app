// src/features/notifications/contexts/NotificationsContext.js - Updated with Error Handling

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSocket } from '../../common/contexts/SocketContext';
import { useAuth } from '../../auth/contexts/AuthContext';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/api';
import { useApiError } from '../../common/contexts/ApiErrorContext';

const NotificationsContext = createContext();

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const { token, user } = useAuth();
  const socket = useSocket();
  const { handleApiError } = useApiError();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications from API
  const fetchUserNotifications = useCallback(async () => {
    if (!token || !user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use handleApiError to wrap the API call
      const fetchWithHandling = handleApiError(fetchNotifications, {
        showGlobalError: false,
        onError: (err) => setError(err)
      });
      
      const data = await fetchWithHandling();
      
      if (data && data.notifications) {
        setNotifications(data.notifications);
        // Calculate unread count based on fetched data
        const unread = data.notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      } else {
        throw new Error('Invalid response format from notifications API');
      }
    } catch (err) {
      // Error is handled by handleApiError
    } finally {
      setLoading(false);
    }
  }, [token, user, handleApiError]);

  // Initial fetch on mount or when token/user changes
  useEffect(() => {
    fetchUserNotifications();
  }, [fetchUserNotifications]);

  // Listen for notification events using the shared socket
  useEffect(() => {
    if (socket && token && user) {
      const handleNotification = (notification) => {
        console.log('Received notification:', notification);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      };

      socket.on('notification', handleNotification);

      return () => {
        socket.off('notification', handleNotification);
      };
    }
  }, [socket, token, user]);

  // Mark a single notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      
      setUnreadCount((prev) => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      throw error;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      
      return true;
    } catch (error) {
      throw error;
    }
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        loading,
        error,
        setError,
        refetchNotifications: fetchUserNotifications
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

// Add PropTypes for props validation
NotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
