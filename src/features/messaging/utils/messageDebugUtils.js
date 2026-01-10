/**
 * Debug utilities for message processing
 * Use these in browser console for testing
 */

import { classifyMessage } from '../utils/messageClassifier';
import { normalizeLoadedMessage } from '../utils/messageNormalizer';
import { logger } from '@/shared/services/logger';

const debugLogger = logger.tag('Debug');

// Test message classification
window.debugMessageClassification = (testMessage) => {
  try {
    const result = classifyMessage(testMessage);
    debugLogger.debug('Message classification debug result', result);
  } catch (error) {
    debugLogger.error('Classification failed', error);
  }
};

// Test message normalization
window.debugMessageNormalization = (testMessage) => {
  try {
    const result = normalizeLoadedMessage(testMessage);
    debugLogger.debug('Message normalization debug result', result);
  } catch (error) {
    debugLogger.error('Normalization failed', error);
  }
};

// Test with sample messages
window.debugSampleMessages = () => {
  const samples = [
    {
      payload: {
        type: 'message.updated',
        properties: {
          info: { summary: { body: 'Hello world' } },
          sessionID: 'test-session'
        }
      }
    },
    {
      type: 'message.loaded',
      info: { summary: { body: 'Loaded message' } },
      sessionId: 'test-session'
    },
    {},
    null
  ];

  samples.forEach((sample, index) => {
    debugLogger.debug(`Sample ${index + 1} classification`, classifyMessage(sample));
    debugLogger.debug(`Sample ${index + 1} normalization`, normalizeLoadedMessage(sample));
  });
};