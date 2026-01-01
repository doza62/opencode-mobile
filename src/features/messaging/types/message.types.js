/**
 * @typedef {Object} ProcessedMessage
 * @property {string} id - Unique UI identifier
 * @property {string} messageId - API message identifier
 * @property {string} type - Message type (sent, message_finalized, etc.)
 * @property {string} category - Message category (message, internal, unclassified)
 * @property {string} message - Display message text
 * @property {string} projectName - Associated project name
 * @property {string} icon - Display icon
 * @property {string} sessionId - Associated session ID
 * @property {string} mode - Message mode (build, plan)
 */

/**
 * @typedef {Object} MessageProcessingState
 * @property {Array<ProcessedMessage>} events - Processed event messages
 * @property {Array<ProcessedMessage>} unclassifiedMessages - Unclassified messages
 * @property {Object} groupedUnclassifiedMessages - Grouped by payload type
 */

/**
 * @typedef {Object} MessageProcessingActions
 * @property {Function} processMessage - Process raw message
 * @property {Function} addEvent - Add message to events
 * @property {Function} clearEvents - Clear all events
 * @property {Function} loadMessages - Load messages for session
 */

// Export empty object to make this a valid module
export {};