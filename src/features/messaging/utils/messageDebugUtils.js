/**
 * Debug utilities for message processing
 * Use these in browser console for testing
 */

import { classifyMessage } from '../utils/messageClassifier';
import { normalizeLoadedMessage } from '../utils/messageNormalizer';

// Test message classification
window.debugMessageClassification = (testMessage) => {
  console.group('🔍 Message Classification Debug');

  try {
    const result = classifyMessage(testMessage);
  } catch (error) {
    console.error('Classification failed:', error);
  }

  console.groupEnd();
};

// Test message normalization
window.debugMessageNormalization = (testMessage) => {
  console.group('🔄 Message Normalization Debug');

  try {
    const result = normalizeLoadedMessage(testMessage);
  } catch (error) {
    console.error('Normalization failed:', error);
  }

  console.groupEnd();
};

// Test with sample messages
window.debugSampleMessages = () => {
  const samples = [
    // SSE-style message
    {
      payload: {
        type: 'message.updated',
        properties: {
          info: { summary: { body: 'Hello world' } },
          sessionID: 'test-session'
        }
      }
    },

    // Flat loaded message
    {
      type: 'message.loaded',
      info: { summary: { body: 'Loaded message' } },
      sessionId: 'test-session'
    },

    // Empty message
    {},

    // Invalid message
    null
  ];

  samples.forEach((sample, index) => {
    console.group(`📝 Sample ${index + 1}`);
    window.debugMessageClassification(sample);
    window.debugMessageNormalization(sample);
    console.groupEnd();
  });
};