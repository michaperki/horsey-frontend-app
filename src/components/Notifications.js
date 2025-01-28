// src/components/Notifications.js

import React, { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationsContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  if (loading) {
    return (
      <div className="notifications-container p-md bg-light rounded-md shadow-md max-h-60vh">
        <p className="text-primary">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-container p-md bg-light rounded-md shadow-md max-h-60vh">
      <h2 className="text-xl font-bold mb-md text-white">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-white">No notifications to display.</p>
      ) : (
        <div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn btn-primary mb-sm"
            >
              Mark all as read
            </button>
          )}
          <ul className="notification-list">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`notification-item ${
                  notification.read ? 'notification-read' : 'notification-unread'
                } rounded-sm mb-xs transition-fast`}
              >
                <div className="notification-message">{notification.message}</div>
                <div className="notification-meta">
                  <span>{new Date(notification.createdAt).toLocaleString()}</span>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="btn btn-success btn-sm"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notifications;
