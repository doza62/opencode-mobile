/**
 * Configuration and monitoring for message normalization system
 * Provides centralized control and observability
 */

import { normalizationMetrics, NORMALIZATION_CONFIG } from '../utils/messageNormalizer';

/**
 * Normalization system status and health monitoring
 */
export class NormalizationMonitor {
  constructor() {
    this.startTime = Date.now();
    this.errorCounts = new Map();
    this.performanceHistory = [];
  }

  /**
   * Records a normalization error
   * @param {string} errorType - Type of error
   * @param {Error} error - Error object
   */
  recordError(errorType, error) {
    const count = this.errorCounts.get(errorType) || 0;
    this.errorCounts.set(errorType, count + 1);

    console.warn(`📊 Normalization error [${errorType}]:`, error.message);
  }

  /**
   * Records performance metrics
   * @param {Object} metrics - Performance data
   */
  recordPerformance(metrics) {
    this.performanceHistory.push({
      timestamp: Date.now(),
      ...metrics
    });

    // Keep only last 100 entries
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }
  }

  /**
   * Gets current system health status
   * @returns {Object} - Health status report
   */
  getHealthStatus() {
    const uptime = Date.now() - this.startTime;
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    const avgProcessingTime = this.performanceHistory.length > 0
      ? this.performanceHistory.reduce((sum, entry) => sum + (entry.averageProcessingTime || 0), 0) / this.performanceHistory.length
      : 0;

    return {
      uptime,
      totalErrors,
      errorBreakdown: Object.fromEntries(this.errorCounts),
      averageProcessingTime: avgProcessingTime,
      config: { ...NORMALIZATION_CONFIG },
      metrics: normalizationMetrics.getStats()
    };
  }

  /**
   * Resets monitoring data
   */
  reset() {
    this.errorCounts.clear();
    this.performanceHistory.length = 0;
    normalizationMetrics.reset();
  }
}

// Global monitor instance
export const normalizationMonitor = new NormalizationMonitor();

/**
 * Configuration presets for different environments
 */
export const CONFIG_PRESETS = {
  development: {
    ...NORMALIZATION_CONFIG,
    enableValidation: true,
    enableMetrics: true,
    enableParallelProcessing: false, // Safer for debugging
    logLevel: 'debug',
    enableStructureLogging: true
  },

  production: {
    ...NORMALIZATION_CONFIG,
    enableValidation: true,
    enableMetrics: true,
    enableParallelProcessing: true,
    logLevel: 'warn',
    enableStructureLogging: false
  },

  performance: {
    ...NORMALIZATION_CONFIG,
    enableValidation: false, // Skip validation for speed
    enableMetrics: false,
    enableParallelProcessing: true,
    logLevel: 'error',
    enableStructureLogging: false,
    defaultBatchSize: 100,
    maxBatchSize: 500
  }
};

/**
 * Applies a configuration preset
 * @param {string} presetName - Name of preset to apply
 * @returns {Object} - Applied configuration
 */
export const applyConfigPreset = (presetName) => {
  const preset = CONFIG_PRESETS[presetName];
  if (!preset) {
    console.warn(`Unknown config preset: ${presetName}`);
    return NORMALIZATION_CONFIG;
  }

  Object.assign(NORMALIZATION_CONFIG, preset);
  console.log(`⚙️ Applied normalization config preset: ${presetName}`);
  return { ...NORMALIZATION_CONFIG };
};

/**
 * Updates individual configuration values
 * @param {Object} updates - Configuration updates
 * @returns {Object} - Updated configuration
 */
export const updateConfig = (updates) => {
  Object.assign(NORMALIZATION_CONFIG, updates);
  console.log('⚙️ Updated normalization config:', updates);
  return { ...NORMALIZATION_CONFIG };
};

/**
 * Gets current configuration
 * @returns {Object} - Current configuration
 */
export const getConfig = () => ({ ...NORMALIZATION_CONFIG });

/**
 * Performance profiling utilities
 */
export const performanceProfiler = {
  /**
   * Profiles a normalization operation
   * @param {Function} operation - Operation to profile
   * @param {string} label - Label for profiling
   * @returns {*} - Operation result
   */
  profile(operation, label = 'normalization') {
    const startTime = performance.now();
    const startMemory = performance.memory?.usedJSHeapSize;

    try {
      const result = operation();

      const endTime = performance.now();
      const endMemory = performance.memory?.usedJSHeapSize;

      const metrics = {
        duration: endTime - startTime,
        memoryDelta: endMemory ? endMemory - startMemory : 0,
        label
      };

      normalizationMonitor.recordPerformance(metrics);
      console.debug(`⏱️ ${label} completed in ${metrics.duration.toFixed(2)}ms`);

      return result;
    } catch (error) {
      const endTime = performance.now();
      normalizationMonitor.recordError('profiled_operation', error);
      console.error(`❌ ${label} failed after ${(endTime - startTime).toFixed(2)}ms:`, error);
      throw error;
    }
  }
};

/**
 * Debug utilities for development
 */
export const debugUtils = {
  /**
   * Logs detailed message structure analysis
   * @param {Object} message - Message to analyze
   * @param {string} context - Context where analysis is performed
   */
  analyzeMessageStructure(message, context = 'unknown') {
    if (!NORMALIZATION_CONFIG.enableStructureLogging) return;

    const structure = detectMessageStructure(message);
    const validation = validateMessageStructure(message, structure);

    console.group(`🔍 Message Structure Analysis [${context}]`);
    console.log('Structure Type:', structure);
    console.log('Validation:', validation);
    console.log('Message Keys:', Object.keys(message));
    console.log('Payload Keys:', message.payload ? Object.keys(message.payload) : 'none');
    console.log('Full Message:', message);
    console.groupEnd();
  },

  /**
   * Enables/disables detailed logging
   * @param {boolean} enabled - Whether to enable detailed logging
   */
  setDetailedLogging(enabled) {
    updateConfig({ enableStructureLogging: enabled });
  }
};

// Re-export for convenience
export { CONFIG_PRESETS, NORMALIZATION_CONFIG };