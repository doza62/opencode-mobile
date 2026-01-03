/**
 * Utility functions for session list formatting and sorting
 */

/**
 * Sorts sessions by date
 * @param {Array} sessions - List of sessions
 * @returns {Array} Sorted sessions
 */
export const sortSessionsByDate = (sessions) => {
  return [...sessions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Formats session display title
 * @param {Object} session - Session object
 * @returns {string} Formatted title
 */
export const formatSessionTitle = (session) => {
  return session?.title || 'Untitled Session';
};