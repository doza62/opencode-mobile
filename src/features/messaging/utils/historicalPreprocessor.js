/**
 * Historical Messages Pre-processor
 * Handles messages loaded from /messages API endpoint
 *
 * Expected input structure (from the messages array you shared):
 * {
 *   info: { role, id, sessionID, mode, agent, created, model, ... },
 *   parts: [ { text, type } ],
 *   messageId: "...",
 *   sessionId: "...",
 *   type: "message.loaded" | etc,
 *   // ...other flat properties
 * }
 */
import { logger } from '@/shared/services/logger';

const historicalLogger = logger.tag('HistoricalPreprocessor');

/**
 * Pre-processes a single historical message
 * @param {Object} rawMessage - Raw historical message from API
 * @param {Object} options - Processing options
 * @returns {Object} - Pre-processed message
 */
export const preprocessHistoricalMessage = (rawMessage, options = {}) => {
  const { includeRaw = false, sessionId = null, projectName = null } = options;

  if (!rawMessage || typeof rawMessage !== 'object') {
    historicalLogger.warn('Invalid historical message received');
    return createInvalidHistoricalMessage('Invalid historical message');
  }

  // Detect structure type
  const structureType = detectHistoricalStructure(rawMessage);

  if (structureType === 'unknown') {
    historicalLogger.warn('Unknown historical message structure', {
      hasInfo: !!rawMessage.info,
      hasParts: !!rawMessage.parts,
      hasProperties: !!rawMessage.properties,
      hasMessageId: !!rawMessage.messageId,
      hasId: !!rawMessage.id,
      type: rawMessage.type,
      keys: Object.keys(rawMessage).join(', '),
    });
    return createInvalidHistoricalMessage('Unknown structure');
  }

  // Extract common fields
  const info = rawMessage.info || {};
  const parts = rawMessage.parts || rawMessage.properties?.parts || [];
  const messageId = rawMessage.messageId || rawMessage.id || info.id || generateId();

  // Extract session ID
  const extractedSessionId =
    rawMessage.sessionId || rawMessage.session_id || info.sessionID || sessionId;

  // Extract role - MUST use info.role for proper classification
  const extractedRole = info.role || rawMessage.role || null;

  historicalLogger.debug('Processing historical message', {
    hasInfo: !!rawMessage.info,
    infoRole: info.role,
    rawRole: rawMessage.role,
    extractedRole,
    payloadType: rawMessage.type,
    hasParts: parts.length > 0,
  });

  // Infer role from message type (user/system cases only)
  if (!extractedRole) {
    const msgType = rawMessage.type?.toLowerCase();
    if (msgType === 'user' || msgType === 'sent' || msgType === 'message.created') {
      extractedRole = 'user';
    } else if (msgType === 'system' || msgType === 'system_message') {
      extractedRole = 'system';
    }
  }

  // Check parts for assistant indicators (reasoning/output = assistant)
  if (!extractedRole && parts.length > 0) {
    const hasReasoning = parts.some(p => p.type === 'reasoning');
    const hasOutput = parts.some(p => p.type === 'output');

    if (hasReasoning || hasOutput) {
      extractedRole = 'assistant';
    }
  }

  const hasReasoning = parts.some(p => p.type === 'reasoning');
  const messageType = hasReasoning ? 'reasoning' : 'text';

  // Pre-processed message structure
  const processed = {
    // Source identification
    source: 'historical',
    messageId,
    sessionId: extractedSessionId,
    payloadType: rawMessage.type || 'message.loaded',
    timestamp: info.created ? new Date(info.created).getTime() : Date.now(),

    role: extractedRole,
    type: messageType,
    agent: info.agent || rawMessage.agent || null,
    mode: info.mode || rawMessage.mode || 'build',

    // Text content from parts
    text: extractHistoricalText(parts, rawMessage),

    // All parts for detailed display (handle both content and text fields)
    parts: parts.map(part => ({
      type: part.type,
      text: part.content || part.text,
      contentType: part.contentType,
    })),

    // Reasoning content (handle both content and text fields)
    reasoning:
      parts.find(p => p.type === 'reasoning')?.content ||
      parts.find(p => p.type === 'reasoning')?.text ||
      null,

    // Metadata
    model: info.model || rawMessage.model || null,
    createdAt: info.created || rawMessage.created || null,
    updatedAt: info.updated || rawMessage.updated || null,

    // Project context
    projectName: projectName || rawMessage.projectName || null,

    // Completion status
    isComplete: true, // Historical messages are always complete

    // Raw data for debugging
    ...(includeRaw && { rawData: rawMessage }),
  };

  historicalLogger.debug('Historical message pre-processed', {
    type: processed.type,
    hasText: !!processed.text,
    partsCount: parts.length,
  });

  return processed;
};

/**
 * Batch pre-process historical messages
 * @param {Array} messages - Array of historical messages from API
 * @param {Object} options - Processing options
 * @returns {Array} - Array of pre-processed messages
 */
export const preprocessHistoricalMessages = (messages, options = {}) => {
  if (!Array.isArray(messages)) {
    historicalLogger.warn('preprocessHistoricalMessages received non-array');
    return [];
  }

  const processed = messages.map(msg => preprocessHistoricalMessage(msg, options));

  historicalLogger.debug(`Pre-processed ${processed.length} historical messages`);

  return processed;
};

/**
 * Detects the structure type of a historical message
 */
const detectHistoricalStructure = message => {
  // Check for "loaded" structure (info + parts at top level)
  if (message.info && (message.parts || message.properties?.parts)) {
    return 'loaded';
  }

  // Check for "flat" structure (direct properties)
  if (message.properties?.info || message.info) {
    return 'flat';
  }

  // Check for minimal structure
  if (message.messageId || message.id || message.type) {
    return 'minimal';
  }

  return 'unknown';
};

/**
 * Extracts text content from historical message parts
 * Handles multiple part structures seen in /messages API response
 */
const extractHistoricalText = (parts, rawMessage) => {
  // Priority 1: Check for parts array with 'content' or 'text' field
  if (Array.isArray(parts) && parts.length > 0) {
    // Try extracting from parts with type === 'text'
    const textParts = parts
      .filter(part => part && (part.type === 'text' || part.type === 'output'))
      .map(part => part.content || part.text || '')
      .filter(text => text.length > 0);

    if (textParts.length > 0) {
      return textParts.join('\n');
    }

    // Try ANY part with content/text (less strict)
    const anyParts = parts
      .filter(part => part && (part.content || part.text))
      .map(part => part.content || part.text)
      .join('\n');

    if (anyParts.length > 0) {
      return anyParts;
    }
  }

  // Priority 2: Direct message field
  if (rawMessage.message && typeof rawMessage.message === 'string') {
    return rawMessage.message;
  }

  // Priority 3: Info summary
  if (rawMessage.info?.summary?.body) {
    return rawMessage.info.summary.body;
  }

  // Priority 4: info.message
  if (rawMessage.info?.message && typeof rawMessage.info.message === 'string') {
    return rawMessage.info.message;
  }

  // Priority 5: Check for nested parts structure
  if (rawMessage.parts?.parts && Array.isArray(rawMessage.parts.parts)) {
    const nestedParts = rawMessage.parts.parts
      .filter(part => part && (part.content || part.text))
      .map(part => part.content || part.text)
      .join('\n');

    if (nestedParts.length > 0) {
      return nestedParts;
    }
  }

  return null;
};

/**
 * Creates an invalid message placeholder for historical
 */
const createInvalidHistoricalMessage = reason => ({
  source: 'historical',
  type: 'invalid',
  error: true,
  text: null,
  messageId: generateId(),
  timestamp: Date.now(),
});

/**
 * Generates a unique ID
 */
const generateId = () => {
  return `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sorts historical messages by timestamp
 */
export const sortHistoricalMessagesByTime = messages => {
  return [...messages].sort((a, b) => {
    return (a.timestamp || 0) - (b.timestamp || 0);
  });
};

/**
 * Groups historical messages by conversation/session
 */
export const groupHistoricalMessages = (messages, groupBy = 'sessionId') => {
  const groups = {};

  messages.forEach(message => {
    const key = message[groupBy] || 'unknown';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(message);
  });

  return groups;
};
