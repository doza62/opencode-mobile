/**
 * Message normalizer for handling different data structures from loaded vs SSE messages
 * Provides robust, performant transformation to standardized format
 */

import { generateMessageId } from './messageIdGenerator';
import { MESSAGE_SCHEMAS } from '@/shared/constants';
import { logger } from '@/shared';

/**
 * Detects the structure type of a message
 * @param {Object} message - Raw message object
 * @returns {string} - Schema type ('SSE', 'LOADED', or 'UNKNOWN')
 */
export const detectMessageStructure = (message) => {
  if (!message || typeof message !== 'object') {
    return 'UNKNOWN';
  }

  // Check for SSE structure (has payload with nested properties)
  if (message.payload?.properties?.info) {
    return 'SSE';
  }

  // Check for loaded structure (flat with direct properties)
  if (message.properties?.info || message.info) {
    return 'LOADED';
  }

  return 'UNKNOWN';
};

/**
 * Validates message structure against expected schema
 * @param {Object} message - Message to validate
 * @param {string} expectedType - Expected structure type
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateMessageStructure = (message, expectedType) => {
  const errors = [];
  const schema = MESSAGE_SCHEMAS[expectedType];

  if (!schema) {
    errors.push(`Unknown schema type: ${expectedType}`);
    return { isValid: false, errors };
  }

  // Basic structure checks
  if (!message || typeof message !== 'object') {
    errors.push('Message must be a valid object');
    return { isValid: false, errors };
  }

  // Schema-specific validation
  if (schema.hasPayload && !message.payload) {
    errors.push('SSE message missing payload property');
  }

  if (schema.propertiesPath && !getNestedProperty(message, schema.propertiesPath.split('.'))) {
    errors.push(`Message missing properties at path: ${schema.propertiesPath}`);
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Safely gets nested property from object
 * @param {Object} obj - Object to traverse
 * @param {string[]} path - Property path array
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} - Property value or default
 */
const getNestedProperty = (obj, path, defaultValue = undefined) => {
  return path.reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue;
  }, obj);
};

/**
 * Transforms a loaded message to SSE-compatible structure
 * @param {Object} loadedMessage - Raw loaded message
 * @returns {Object} - SSE-compatible message structure
 */
export const normalizeLoadedMessage = (loadedMessage) => {
  try {
    const structureType = detectMessageStructure(loadedMessage);

    if (structureType === 'SSE') {
      // Already in correct format
      return loadedMessage;
    }

    if (structureType === 'UNKNOWN') {
      logger.warn('Unable to determine message structure, applying fallback transformation');
      return createFallbackMessage(loadedMessage);
    }

    // Transform LOADED structure to SSE structure
    const normalized = {
      // Preserve original fields
      ...loadedMessage,

      // Add payload wrapper if missing
      payload: loadedMessage.payload || {
        type: loadedMessage.type || 'unknown',
        properties: {
          info: loadedMessage.info || loadedMessage.properties?.info || {},
          sessionID: loadedMessage.sessionId || loadedMessage.session_id || loadedMessage.properties?.sessionID,
          // Copy other properties
          ...loadedMessage.properties
        }
      }
    };

    // Ensure session ID is accessible at top level
    if (!normalized.sessionId && !normalized.session_id) {
      normalized.sessionId = getNestedProperty(normalized, ['payload', 'properties', 'sessionID']);
    }

    // Ensure message has an ID for React keys
    if (!normalized.id) {
      normalized.id = generateMessageId();
    }

    logger.debug('Normalized loaded message', {
      originalType: loadedMessage.type,
      structureType,
      normalizedType: normalized.payload?.type,
      hasSessionId: !!(normalized.sessionId || normalized.session_id)
    });

    return normalized;

  } catch (error) {
    logger.error('Failed to normalize loaded message', error);
    return createFallbackMessage(loadedMessage);
  }
};

/**
 * Batch normalizes multiple loaded messages with performance optimizations
 * @param {Array} rawMessages - Array of raw loaded messages
 * @param {Object} options - Processing options
 * @returns {Array} - Array of normalized SSE-compatible messages
 */
export const normalizeLoadedMessages = (rawMessages, options = {}) => {
  const {
    batchSize = 50,
    enableParallel = true,
    onProgress = null,
    onError = null
  } = options;

  if (!Array.isArray(rawMessages)) {
    logger.warn('normalizeLoadedMessages expects an array', { received: typeof rawMessages });
    return [];
  }

  if (rawMessages.length === 0) {
    return [];
  }

  const normalized = [];
  const errors = [];

  // Process in batches for performance
  for (let i = 0; i < rawMessages.length; i += batchSize) {
    const batch = rawMessages.slice(i, i + batchSize);

    try {
      const batchResults = enableParallel && batch.length > 10
        ? batch.map(msg => normalizeLoadedMessage(msg)) // Could be parallelized with Web Workers in future
        : batch.map(msg => normalizeLoadedMessage(msg));

      normalized.push(...batchResults);

      if (onProgress) {
        onProgress({
          processed: Math.min(i + batchSize, rawMessages.length),
          total: rawMessages.length,
          errors: errors.length
        });
      }

    } catch (batchError) {
      logger.error(`Batch normalization failed for batch ${Math.floor(i/batchSize) + 1}`, batchError);
      errors.push({ batchIndex: Math.floor(i/batchSize), error: batchError });

      if (onError) {
        onError(batchError, batch);
      }

      // Continue with next batch instead of failing completely
    }
  }

  logger.emoji('✅', `Normalized ${normalized.length} messages (${errors.length} batch errors)`);

  return normalized;
};

/**
 * Creates a fallback message for unparseable messages
 * @param {Object} rawMessage - Raw message that couldn't be normalized
 * @returns {Object} - Basic message structure for error handling
 */
const createFallbackMessage = (rawMessage) => {
  return {
    id: generateMessageId(),
    type: 'unclassified',
    category: 'unclassified',
    payload: {
      type: 'unknown',
      properties: {
        info: {},
        sessionID: rawMessage?.sessionId || rawMessage?.session_id
      }
    },
    sessionId: rawMessage?.sessionId || rawMessage?.session_id,
    displayMessage: 'Unable to process message structure',
    rawData: rawMessage,
    icon: '❌'
  };
};

/**
 * Performance monitoring utilities
 */
export const normalizationMetrics = {
  processed: 0,
  errors: 0,
  averageTime: 0,
  lastBatchSize: 0,

  recordMetrics(processedCount, errorCount, processingTime) {
    this.processed += processedCount;
    this.errors += errorCount;
    this.averageTime = (this.averageTime + processingTime) / 2;
    this.lastBatchSize = processedCount;
  },

  reset() {
    this.processed = 0;
    this.errors = 0;
    this.averageTime = 0;
    this.lastBatchSize = 0;
  },

  getStats() {
    return {
      totalProcessed: this.processed,
      errorRate: this.errors / Math.max(this.processed, 1),
      averageProcessingTime: this.averageTime,
      throughput: this.processed / Math.max(this.averageTime, 1) // messages per ms
    };
  }
};

import { NORMALIZATION_CONFIG } from '@/shared/constants';

/**
 * Plugin system for extensible normalization (future-proofing)
 */
export class MessageNormalizerPlugin {
  constructor(name, condition, transformer) {
    this.name = name;
    this.condition = condition; // Function to check if plugin applies
    this.transformer = transformer; // Function to transform message
    this.enabled = true;
  }

  applies(message) {
    return this.enabled && this.condition(message);
  }

  transform(message) {
    return this.transformer(message);
  }
}

// Registry for normalization plugins
export const normalizerPlugins = [];

/**
 * Registers a new normalization plugin
 * @param {MessageNormalizerPlugin} plugin - Plugin to register
 */
export const registerNormalizerPlugin = (plugin) => {
  if (!(plugin instanceof MessageNormalizerPlugin)) {
    throw new Error('Plugin must be an instance of MessageNormalizerPlugin');
  }

  normalizerPlugins.push(plugin);
  logger.emoji('🔌', `Registered normalization plugin: ${plugin.name}`);
};

/**
 * Applies all applicable plugins to a message
 * @param {Object} message - Message to transform
 * @returns {Object} - Transformed message
 */
export const applyNormalizerPlugins = (message) => {
  let transformed = { ...message };

  for (const plugin of normalizerPlugins) {
    if (plugin.applies(transformed)) {
      try {
        transformed = plugin.transform(transformed);
        console.debug(`🔌 Applied plugin ${plugin.name} to message`);
      } catch (error) {
        console.warn(`🔌 Plugin ${plugin.name} failed:`, error);
        // Continue with other plugins
      }
    }
  }

  return transformed;
};

/**
 * Example Plugins - Demonstrating extensibility
 */

// Plugin to handle legacy API message format
export const legacyApiPlugin = new MessageNormalizerPlugin(
  'legacy-api-format',
  (message) => message.apiVersion === 'legacy' || message.legacyFormat === true,
  (message) => ({
    ...message,
    payload: {
      type: message.eventType || message.type,
      properties: {
        info: message.data || message.info || {},
        sessionID: message.sessionId || message.data?.sessionId
      }
    },
    // Remove legacy fields
    apiVersion: undefined,
    legacyFormat: undefined,
    eventType: undefined
  })
);

// Plugin to handle compressed message format
export const compressedMessagePlugin = new MessageNormalizerPlugin(
  'compressed-format',
  (message) => message.compressed === true || message.format === 'compressed',
  (message) => {
    // Simulate decompression (in real implementation, this would decompress)
    return {
      ...message,
      payload: message.payload || {
        type: message.type,
        properties: {
          info: message.decompressedInfo || {},
          sessionID: message.sessionId
        }
      },
      compressed: undefined,
      format: undefined
    };
  }
);

// Plugin to add telemetry data
export const telemetryPlugin = new MessageNormalizerPlugin(
  'telemetry-enhancer',
  (message) => NORMALIZATION_CONFIG.enableMetrics === true,
  (message) => ({
    ...message,
    telemetry: {
      normalizedAt: Date.now(),
      originalStructure: detectMessageStructure(message),
      processingTime: 0 // Would be set by the normalizer
    }
  })
);

/**
 * Initializes default plugins
 * Call this during app startup
 */
export const initializeDefaultPlugins = () => {
  // Register built-in plugins
  registerNormalizerPlugin(legacyApiPlugin);
  registerNormalizerPlugin(compressedMessagePlugin);

  // Only register telemetry plugin if metrics are enabled
  if (NORMALIZATION_CONFIG.enableMetrics) {
    registerNormalizerPlugin(telemetryPlugin);
  }

  logger.emoji('🔌', `Initialized ${normalizerPlugins.length} normalization plugins`);
};