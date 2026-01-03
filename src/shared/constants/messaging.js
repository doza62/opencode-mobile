/**
 * Messaging-related constants and configurations
 */

/**
 * Schema definitions for different message types
 */
export const MESSAGE_SCHEMAS = {
  // SSE message structure (nested payload)
  SSE: {
    hasPayload: true,
    payloadPath: 'payload',
    propertiesPath: 'payload.properties',
    infoPath: 'payload.properties.info'
  },

  // API loaded message structure (potentially flat)
  LOADED: {
    hasPayload: false,
    propertiesPath: 'properties',
    infoPath: 'info'
  }
};

/**
 * Configuration for different normalization strategies
 */
export let NORMALIZATION_CONFIG = {
  // Enable/disable features
  enableValidation: true,
  enableMetrics: true,
  enableParallelProcessing: true,

  // Performance tuning
  defaultBatchSize: 50,
  maxBatchSize: 200,

  // Error handling
  maxRetries: 3,
  errorThreshold: 0.1, // 10% error rate triggers warning

  // Logging
  logLevel: 'debug', // 'debug', 'info', 'warn', 'error'
  enableStructureLogging: true
};