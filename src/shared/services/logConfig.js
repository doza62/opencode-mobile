/**
 * Logging configuration for the application
 */

import { __DEV__ } from 'react-native';
import { LOG_LEVELS } from './logger';

export const LOG_CONFIG = {
  defaultLevel: __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN,

  contexts: {
    SSE_FLOW: __DEV__,
    MESSAGE_PROCESSING: __DEV__,
    SESSION_MANAGEMENT: true,
    API_CALLS: true,
    UI_EVENTS: false,
    NOTIFICATIONS: true,
    STORAGE: true,
    PERFORMANCE: __DEV__
  },

  rateLimits: {
    SessionFilter: 1,
    MessageProcessing: 5,
    SSE: 10,
    Default: 10
  },

  performance: {
    enabled: __DEV__,
    slowOperationThreshold: 500,
    logSlowOperations: true
  },

  features: {
    taggedLoggers: true,
    contextFiltering: true,
    rateLimiting: true,
    performanceTracking: true,
    emojiLogging: false
  }
};

export const getEnvironmentConfig = (environment) => {
  const configs = {
    development: {
      level: LOG_LEVELS.DEBUG,
      contexts: {
        SSE_FLOW: true,
        MESSAGE_PROCESSING: true,
        SESSION_MANAGEMENT: true,
        API_CALLS: true,
        UI_EVENTS: true,
        NOTIFICATIONS: true,
        STORAGE: true,
        PERFORMANCE: true
      },
      performance: { enabled: true, slowOperationThreshold: 500, logSlowOperations: true }
    },
    staging: {
      level: LOG_LEVELS.INFO,
      contexts: {
        SSE_FLOW: false,
        MESSAGE_PROCESSING: false,
        SESSION_MANAGEMENT: true,
        API_CALLS: true,
        UI_EVENTS: false,
        NOTIFICATIONS: true,
        STORAGE: true,
        PERFORMANCE: false
      },
      performance: { enabled: false, slowOperationThreshold: 1000, logSlowOperations: false }
    },
    production: {
      level: LOG_LEVELS.WARN,
      contexts: {
        SSE_FLOW: false,
        MESSAGE_PROCESSING: false,
        SESSION_MANAGEMENT: true,
        API_CALLS: false,
        UI_EVENTS: false,
        NOTIFICATIONS: true,
        STORAGE: false,
        PERFORMANCE: false
      },
      performance: { enabled: false, slowOperationThreshold: 2000, logSlowOperations: false }
    }
  };

  return configs[environment] || configs.development;
};

export default LOG_CONFIG;
