
// frontend/src/components/Notifications.js

import React, { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationsContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Notifications.css'; // Assume you have CSS

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
    return <div style={styles.container}><p>Loading notifications...</p></div>;
  }

  return (
    <div style={styles.notification_container}>
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications to display.</p>
      ) : (
        <div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} style={styles.markAllButton}>
              Mark all as read
            </button>
          )}
          <ul style={styles.list}>
            {notifications.map((notification) => (
              <li key={notification._id} style={notification.read ? styles.read : styles.unread}>
                <div style={styles.message}>{notification.message}</div>
                <div style={styles.meta}>
                  <span>{new Date(notification.createdAt).toLocaleString()}</span>
                  {!notification.read && (
                    <button onClick={() => handleMarkAsRead(notification._id)} style={styles.markButton}>
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

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: 'auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    marginTop: '50px',
  },
  markAllButton: {
    backgroundColor: '#0a2a4d',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  read: {
    backgroundColor: '#fff',
    padding: '10px',
    borderBottom: '1px solid #ddd',
  },
  unread: {
    backgroundColor: '#e6f7ff',
    padding: '10px',
    borderBottom: '1px solid #ddd',
  },
  message: {
    fontSize: '16px',
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#555',
    marginTop: '5px',
  },
  markButton: {
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
};

export default Notifications;

