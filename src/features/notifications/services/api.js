// src/features/notifications/services/api.js - Updated for new error handling

import { apiFetch } from '../../common/services/api';

/**
 * Creates a new notification.
 * @param {object} notificationData - Data for the new notification.
 * @param {string} notificationData.message - The notification message.
 * @param {string} [notificationData.type] - The type of notification.
 * @returns {Promise<object>} - The response data from the API.
 */
export const createNotification = async (notificationData) => {
  const data = await apiFetch('/notifications', {
    method: 'POST',
    body: JSON.stringify(notificationData),
  });
  return data;
};

/**
 * Fetches notifications.
 * @param {boolean} [read=false] - Filter by read/unread notifications.
 * @returns {Promise<object>} - Notifications data.
 */
export const fetchNotifications = async (read = false) => {
  return apiFetch('/notifications', {
    method: 'GET',
    params: { read },
  });
};

/**
 * Marks a specific notification as read.
 * @param {string} notificationId - ID of the notification to mark as read.
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (notificationId) => {
  return apiFetch(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
};

/**
 * Marks all notifications as read.
 * @returns {Promise<void>}
 */
export const markAllNotificationsAsRead = async () => {
  return apiFetch('/notifications/read-all', {
    method: 'POST',
  });
};

export const notificationsApi = {
  createNotification,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

export default notificationsApi;
