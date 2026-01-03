/**
 * Utility functions for connection status formatting and validation
 */

/**
 * Formats connection status text
 * @param {boolean} isConnected - Connection status
 * @returns {string} Formatted status text
 */
export const formatStatusText = (isConnected) => {
  return isConnected ? 'Connected' : 'Disconnected';
};

/**
 * Gets status color for UI
 * @param {boolean} isConnected - Connection status
 * @returns {string} Color string
 */
export const getStatusColor = (isConnected) => {
  return isConnected ? '#4caf50' : '#f44336';
};

/**
 * Validates server URL
 * @param {string} url - Server URL
 * @returns {boolean} Is valid
 */
export const isValidServerUrl = (url) => {
  return url && url.startsWith('http');
};