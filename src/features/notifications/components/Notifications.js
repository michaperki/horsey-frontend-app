// src/features/notifications/components/Notifications.js - Updated with wrapper for centering

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../contexts/NotificationsContext';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheckCircle, FaSpinner, FaBellSlash } from 'react-icons/fa';
import { ApiError } from '../../common/components/ApiError';
import { useApiError } from '../../common/contexts/ApiErrorContext';
import './Notifications.css';

const Notifications = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    loading,
    error,
    setError,
    refetchNotifications 
  } = useNotifications();
  
  const { user } = useAuth();
  const { handleApiError } = useApiError();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleMarkAsRead = async (id) => {
    const markAsReadWithHandling = handleApiError(markAsRead, {
      showGlobalError: false,
      onError: (err) => setError(err)
    });
    
    await markAsReadWithHandling(id);
  };

  const handleMarkAllAsRead = async () => {
    const markAllAsReadWithHandling = handleApiError(markAllAsRead, {
      showGlobalError: false,
      onError: (err) => setError(err)
    });
    
    await markAllAsReadWithHandling();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 70, 
        damping: 15, 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 15 }
    },
    hover: {
      scale: 1.05,
      y: -2,
      transition: { type: "spring", stiffness: 300, damping: 10 }
    },
    tap: {
      scale: 0.95,
      y: 0
    }
  };

  if (loading) {
    return (
      <div className="notifications-wrapper">
        <motion.div 
          className="notifications-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="loading-container">
            <FaSpinner className="loading-spinner" />
            <p>Loading notifications...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="notifications-wrapper">
      <motion.div 
        className="notifications-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="notifications-header">
          <motion.h2 
            className="notifications-title"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <FaBell /> Notifications
            {unreadCount > 0 && (
              <motion.span 
                className="notification-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 10, 
                  delay: 0.3 
                }}
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.h2>
        </div>
        
        {/* Display any errors */}
        {error && (
          <div className="notifications-error-container">
            <ApiError 
              error={error} 
              onDismiss={() => setError(null)}
              onRetry={refetchNotifications}
            />
          </div>
        )}
        
        {notifications.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <FaBellSlash />
            <p>No notifications to display.</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {unreadCount > 0 && (
              <motion.button
                onClick={handleMarkAllAsRead}
                className="mark-all-btn"
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
              >
                <FaCheckCircle /> Mark all as read
              </motion.button>
            )}
            
            <ul className="notification-list">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.li
                    key={notification._id}
                    className={`notification-item ${
                      notification.read ? 'notification-read' : 'notification-unread'
                    }`}
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-meta">
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      {!notification.read && (
                        <motion.button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="mark-read-btn"
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          Mark as read
                        </motion.button>
                      )}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Notifications;
