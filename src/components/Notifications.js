
// frontend/src/components/Notifications.js

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
      <div className="notifications-container">
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications to display.</p>
      ) : (
        <div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="mark-all-button">
              Mark all as read
            </button>
          )}
          <ul className="notification-list">
            {notifications.map((notification) => (
              <li key={notification._id} className={notification.read ? 'notification-read' : 'notification-unread'}>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-meta">
                  <span>{new Date(notification.createdAt).toLocaleString()}</span>
                  {!notification.read && (
                    <button onClick={() => handleMarkAsRead(notification._id)} className="mark-button">
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

