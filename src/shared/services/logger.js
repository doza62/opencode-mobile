/**
 * Centralized logging service for consistent application logging
 * Supports configurable levels, environment-based filtering, and formatted output
 */

import { __DEV__ } from 'react-native';

// Log levels
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// Current log level - can be overridden
let currentLogLevel = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

/**
 * Sets the global log level
 * @param {number} level - Log level from LOG_LEVELS
 */
export const setLogLevel = (level) => {
  currentLogLevel = level;
};

/**
 * Gets the current log level
 * @returns {number} - Current log level
 */
export const getLogLevel = () => currentLogLevel;

/**
 * Checks if a log level should be output
 * @param {number} level - Level to check
 * @returns {boolean} - Whether to log
 */
const shouldLog = (level) => level >= currentLogLevel;

/**
 * Formats log message with timestamp and level
 * @param {string} level - Log level string
 * @param {string} message - Log message
 * @param {*} data - Optional data to log
 * @returns {string} - Formatted message
 */
const formatMessage = (level, message, data) => {
  const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
  let formatted = `[${timestamp}] ${level}: ${message}`;

  if (data !== undefined) {
    formatted += ` ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}`;
  }

  return formatted;
};

/**
 * Logger class with methods for different log levels
 */
export const logger = {
  /**
   * Debug level logging
   * @param {string} message - Log message
   * @param {*} data - Optional data
   */
  debug: (message, data) => {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.debug(formatMessage('DEBUG', message, data));
    }
  },

  /**
   * Info level logging
   * @param {string} message - Log message
   * @param {*} data - Optional data
   */
  info: (message, data) => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.info(formatMessage('INFO', message, data));
    }
  },

  /**
   * Warning level logging
   * @param {string} message - Log message
   * @param {*} data - Optional data
   */
  warn: (message, data) => {
    if (shouldLog(LOG_LEVELS.WARN)) {
      console.warn(formatMessage('WARN', message, data));
    }
  },

  /**
   * Error level logging
   * @param {string} message - Log message
   * @param {*} data - Optional data
   */
  error: (message, data) => {
    if (shouldLog(LOG_LEVELS.ERROR)) {
      console.error(formatMessage('ERROR', message, data));
    }
  },

  /**
   * Log with custom emoji prefix (for backward compatibility)
   * @param {string} emoji - Emoji prefix
   * @param {string} message - Log message
   * @param {*} data - Optional data
   */
  emoji: (emoji, message, data) => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.log(`${emoji} ${message}`, data !== undefined ? data : '');
    }
  },

  /**
   * Performance logging
   * @param {string} operation - Operation name
   * @param {number} startTime - Start time
   * @param {*} data - Optional additional data
   */
  performance: (operation, startTime, data) => {
    const duration = Date.now() - startTime;
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.debug(formatMessage('PERF', `${operation} took ${duration}ms`, data));
    }
  }
};

// Export individual methods for convenience
export const { debug, info, warn, error, emoji, performance } = logger;

// Default export
export default logger;