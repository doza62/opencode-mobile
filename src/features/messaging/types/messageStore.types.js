/**
 * Message Store Types - messageId-centric message management
 * Groups all message events by their messageId for unified state management
 */

/**
 * @typedef {Object} MessagePart
 * @property {string} partId - Unique identifier for the part
 * @property {string} partType - Type of part ('text' or 'reasoning')
 * @property {string} text - The text content of the part
 * @property {string} [delta] - Delta update for streaming
 * @property {number} timestamp - When the part was received
 */

/**
 * @typedef {Object} MessageEntry
 * @property {string} messageId - The API message identifier (primary key)
 * @property {string} [sessionId] - Associated session ID
 * @property {"user"|"assistant"|null} role - Message role (from message.updated)
 * @property {Array<MessagePart>} parts - Accumulated message parts
 * @property {boolean} finalized - Whether message.updated has been received
 * @property {string|null} finalizedMessage - The final assembled or summary message
 * @property {string} [projectName] - Associated project name
 * @property {string} [mode] - Agent mode (build, plan)
 * @property {number} createdAt - When the message entry was created
 * @property {number} updatedAt - When the message entry was last updated
 * @property {Object} [rawFinalizedData] - Raw data from message.updated event
 */

/**
 * @typedef {Object.<string, MessageEntry>} MessageStoreState
 * A map of messageId to MessageEntry
 */

/**
 * @typedef {Object} MessageStoreActions
 * @property {Function} getOrCreateMessage - Get or create a message entry by ID
 * @property {Function} addPart - Add a part to a message
 * @property {Function} finalizeMessage - Mark a message as finalized with role and content
 * @property {Function} getMessage - Get a message entry by ID
 * @property {Function} getMessagesBySession - Get all messages for a session
 * @property {Function} clearStore - Clear all messages
 * @property {Function} removeMessage - Remove a specific message
 */

/**
 * @typedef {Object} UseMessageStoreReturn
 * @property {MessageStoreState} messageStore - The current message store state
 * @property {MessageStoreActions} actions - Store manipulation actions
 */

// Export empty object to make this a valid module
export {};
