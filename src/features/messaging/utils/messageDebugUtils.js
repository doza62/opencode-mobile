/**
 * Debug utilities for message processing
 * Use these in browser console for testing
 */

import { classifyMessage } from '../utils/messageClassifier';
import { normalizeLoadedMessage } from '../utils/messageNormalizer';

// Test message classification
window.debugMessageClassification = (testMessage) => {
  console.group('🔍 Message Classification Debug');
  console.log('Input message:', testMessage);

  try {
    const result = classifyMessage(testMessage);
    console.log('Classification result:', result);
    console.log('Type:', result.type, 'Category:', result.category);
  } catch (error) {
    console.error('Classification failed:', error);
  }

  console.groupEnd();
};

// Test message normalization
window.debugMessageNormalization = (testMessage) => {
  console.group('🔄 Message Normalization Debug');
  console.log('Input message:', testMessage);

  try {
    const result = normalizeLoadedMessage(testMessage);
    console.log('Normalization result:', result);
    console.log('Normalized structure type:', result.payload ? 'SSE' : 'Unknown');
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

console.log('🐛 Message debug utilities loaded. Use:');
console.log('- debugMessageClassification(msg)');
console.log('- debugMessageNormalization(msg)');
console.log('- debugSampleMessages()');