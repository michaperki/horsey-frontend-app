// src/features/notifications/components/Notifications.js

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../contexts/NotificationsContext';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
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
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 120, damping: 15 }
    },
    exit: { 
      opacity: 0, 
      x: 20,
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
      transition: { type: "spring", stiffness: 300, damping: 10 }
    },
    tap: {
      scale: 0.95
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="notifications-container p-md bg-light rounded-md shadow-md max-h-60vh"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="loading-container flex justify-center items-center flex-col p-lg">
          <FaSpinner className="animate-spin text-3xl text-primary mb-md" />
          <p className="text-primary">Loading notifications...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="notifications-container p-md bg-light rounded-md shadow-md max-h-60vh"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.h2 
        className="text-xl font-bold mb-md"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <FaBell className="inline-block mr-xs text-accent" /> Notifications
        {unreadCount > 0 && (
          <motion.span 
            className="ml-xs text-sm bg-accent text-white px-xs py-xxs rounded-full"
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
      
      {notifications.length === 0 ? (
        <motion.div
          className="empty-state p-lg text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <FaExclamationCircle className="text-3xl text-gray-400 mb-md" />
          <p className="text-gray-400">No notifications to display.</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {unreadCount > 0 && (
            <motion.button
              onClick={handleMarkAllAsRead}
              className="btn btn-primary mb-sm"
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
            >
              <FaCheckCircle className="mr-xs" /> Mark all as read
            </motion.button>
          )}
          
          <ul className="notification-list">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.li
                  key={notification._id}
                  className={`notification-item ${
                    notification.read ? 'notification-read' : 'notification-unread'
                  } rounded-sm mb-xs transition-fast`}
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
                        className="btn btn-success btn-sm"
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
  );
};

export default Notifications;