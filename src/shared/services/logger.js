/**
 * Enhanced logging service for consistent application logging
 * Supports configurable levels, context-based filtering, rate limiting, and performance tracking
 */

import { __DEV__ } from 'react-native';

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

const LOG_LEVEL_NAMES = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'NONE'];

const DEFAULT_CONFIG = {
  level: __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN,
  contexts: {
    SSE_FLOW: true,
    MESSAGE_PROCESSING: true,
    SESSION_MANAGEMENT: true,
    API_CALLS: true,
    UI_EVENTS: false,
    NOTIFICATIONS: true,
    STORAGE: true,
    PERFORMANCE: true
  },
  rateLimits: {
    SessionFilter: 1,
    MessageProcessing: 5,
    SSE: 10,
    Default: 10
  },
  performanceTracking: true,
  slowOperationThreshold: 500
};

let config = { ...DEFAULT_CONFIG };

const noop = () => {};

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }
    return value;
  };
};

const formatMessage = (level, message, data) => {
  const timestamp = new Date().toISOString().slice(11, 23);
  let formatted = `[${timestamp}] ${level}: ${message}`;

  if (data !== undefined) {
    try {
      if (data instanceof Error) {
        formatted += ` ${data.message}\n${data.stack}`;
      } else if (typeof data === 'object' && data !== null) {
        formatted += ` ${JSON.stringify(data, getCircularReplacer(), 2)}`;
      } else {
        formatted += ` ${data}`;
      }
    } catch (e) {
      formatted += ' [Unable to stringify data]';
    }
  }

  return formatted;
};

const shouldLog = (level) => level >= config.level;
const shouldLogContext = (contextName) => config.contexts[contextName] !== false;
const getRateLimit = (category) => config.rateLimits[category] || config.rateLimits.Default;

class RateLimiter {
  constructor(maxPerSecond) {
    this.maxPerSecond = maxPerSecond;
    this.logs = [];
  }

  check() {
    const now = Date.now();
    this.logs = this.logs.filter(t => now - t < 1000);

    if (this.logs.length >= this.maxPerSecond) {
      return false;
    }

    this.logs.push(now);
    return true;
  }
}

const rateLimiters = new Map();

const getRateLimiter = (category) => {
  if (!rateLimiters.has(category)) {
    rateLimiters.set(category, new RateLimiter(getRateLimit(category)));
  }
  return rateLimiters.get(category);
};

class PerformanceTracker {
  constructor() {
    this.operations = new Map();
  }

  start(operation) {
    if (!config.performanceTracking) return;
    this.operations.set(operation, Date.now());
  }

  end(operation) {
    if (!config.performanceTracking) return null;

    const startTime = this.operations.get(operation);
    if (!startTime) return null;

    const duration = Date.now() - startTime;
    this.operations.delete(operation);

    return duration >= config.slowOperationThreshold
      ? { operation, duration, slow: true }
      : { operation, duration, slow: false };
  }
}

const perfTracker = new PerformanceTracker();

export const logger = {
  tag: (tag) => {
    const tagUpper = tag.toUpperCase();
    return {
      debug: (message, data) => logger.debug(`[${tagUpper}] ${message}`, data),
      info: (message, data) => logger.info(`[${tagUpper}] ${message}`, data),
      warn: (message, data) => logger.warn(`[${tagUpper}] ${message}`, data),
      error: (message, data) => logger.error(`[${tagUpper}] ${message}`, data),
      debugCtx: (context, message, data) => logger.debugCtx(context, `[${tagUpper}] ${message}`, data),
      rateLimit: (maxPerSecond) => logger.rateLimit(tag, maxPerSecond),
    };
  },

  rateLimit: (category, maxPerSecond) => {
    const limiter = getRateLimiter(category);
    const taggedLogger = logger.tag(category);

    return {
      debug: (message, data) => {
        if (limiter.check()) {
          taggedLogger.debug(message, data);
        }
      },
      info: (message, data) => {
        if (limiter.check()) {
          taggedLogger.info(message, data);
        }
      },
      warn: (message, data) => {
        if (limiter.check()) {
          taggedLogger.warn(message, data);
        }
      },
      error: (message, data) => {
        if (limiter.check()) {
          taggedLogger.error(message, data);
        }
      },
    };
  },

  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
  debugCtx: noop,
  emoji: noop,

  timeStart: (operation) => perfTracker.start(operation),

  timeEnd: (operation, data) => {
    const result = perfTracker.end(operation);
    if (result) {
      if (result.slow) {
        logger.warn(`[PERF] Slow operation: ${result.operation} took ${result.duration}ms`, data);
      } else if (config.performanceTracking) {
        logger.debug(`[PERF] ${result.operation}: ${result.duration}ms`, data);
      }
    }
    return result;
  },

  setLevel: (level) => {
    if (typeof level === 'string') {
      const levelUpper = level.toUpperCase();
      config.level = LOG_LEVELS[levelUpper] !== undefined ? LOG_LEVELS[levelUpper] : LOG_LEVELS.WARN;
    } else {
      config.level = level;
    }

    updateMethods();

    if (__DEV__) {
      console.log(`Logger level set to: ${LOG_LEVEL_NAMES[config.level]}`);
    }
  },

  getLevel: () => config.level,

  enableContext: (contextName) => {
    config.contexts[contextName] = true;
  },

  disableContext: (contextName) => {
    config.contexts[contextName] = false;
  },

  setContext: (contextName, enabled) => {
    config.contexts[contextName] = enabled;
  },

  getContexts: () => ({ ...config.contexts }),

  setRateLimit: (category, maxPerSecond) => {
    config.rateLimits[category] = maxPerSecond;
    rateLimiters.delete(category);
  },

  enablePerformanceTracking: () => {
    config.performanceTracking = true;
  },

  disablePerformanceTracking: () => {
    config.performanceTracking = false;
  },

  reset: () => {
    config = { ...DEFAULT_CONFIG };
    updateMethods();
  },

  getConfig: () => ({ ...config })
};

const updateMethods = () => {
  const level = config.level;

  if (shouldLog(LOG_LEVELS.DEBUG)) {
    logger.debug = (message, data) => console.debug(formatMessage('DEBUG', message, data));
    logger.info = (message, data) => console.info(formatMessage('INFO', message, data));
  } else if (shouldLog(LOG_LEVELS.INFO)) {
    logger.debug = noop;
    logger.info = (message, data) => console.info(formatMessage('INFO', message, data));
  } else if (shouldLog(LOG_LEVELS.WARN)) {
    logger.debug = noop;
    logger.info = noop;
  } else {
    logger.debug = noop;
    logger.info = noop;
    logger.warn = noop;
  }

  if (shouldLog(LOG_LEVELS.WARN)) {
    logger.warn = (message, data) => console.warn(formatMessage('WARN', message, data));
    logger.error = (message, data) => console.error(formatMessage('ERROR', message, data));
  } else {
    logger.warn = noop;
    logger.error = noop;
  }

  logger.debugCtx = (context, message, data) => {
    if (shouldLogContext(context) && shouldLog(LOG_LEVELS.DEBUG)) {
      console.debug(formatMessage('DEBUG', `[${context}] ${message}`, data));
    }
  };

  logger.emoji = (emoji, message, data) => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      if (data !== undefined) {
        console.log(`${emoji} ${message}`, data);
      } else {
        console.log(`${emoji} ${message}`);
      }
    }
  };
};

updateMethods();

export const { debug, info, warn, error } = logger;
export const createTaggedLogger = logger.tag;
export const { timeStart, timeEnd } = logger;

export default logger;
