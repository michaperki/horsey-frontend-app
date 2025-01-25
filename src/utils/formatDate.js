
// src/utils/formatDate.js

/**
 * Formats a given date string into a human-readable format.
 * If the date string is invalid or null, returns "N/A".
 *
 * @param {string|null} dateString - The ISO date string to format.
 * @returns {string} - The formatted date string or "N/A".
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date)) return "N/A";
  return date.toLocaleString();
};
