// Data formatting and transformation helpers

/**
 * Format timestamp to readable date string
 * @param {number} timestamp - Unix timestamp
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string
 */
export const formatTimestamp = (timestamp, options = {}) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (options.relative && diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (options.relative && diffDays === 1) {
    return 'Yesterday';
  } else if (options.relative && diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString();
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Format file size in human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert camelCase to Title Case
 * @param {string} str - camelCase string
 * @returns {string} - Title Case string
 */
export const camelToTitle = (str) => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
};