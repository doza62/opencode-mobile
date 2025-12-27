// Notification helper utilities
export const notificationHelpers = {
  /**
   * Check if notifications should be shown
   * @param {string} appState - Current app state
   * @param {Object} settings - User notification settings
   * @returns {boolean} - Whether to show notifications
   */
  shouldShowNotification: (appState, settings = {}) => {
    if (appState === 'active') return false;
    return settings.notificationsEnabled !== false;
  },

  /**
   * Format notification message
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @returns {Object} - Formatted notification
   */
  formatNotification: (title, message) => ({
    title: title || 'OpenCode',
    body: message || 'New activity detected',
    sound: 'default',
    priority: 'default'
  })
};