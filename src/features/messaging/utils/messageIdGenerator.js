/**
 * Message ID generator for React keys and message identification
 * Provides unique, stable IDs for messages
 */

let messageCounter = 0;
const usedIds = new Set();

/**
 * Generates a unique message ID
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} - Unique message ID
 */
export const generateMessageId = (prefix = 'msg') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const counter = ++messageCounter;

  let id = `${prefix}_${timestamp}_${random}_${counter}`;

  // Ensure uniqueness (very unlikely to collide, but being safe)
  while (usedIds.has(id)) {
    id = `${prefix}_${timestamp}_${random}_${++counter}`;
  }

  usedIds.add(id);

  // Prevent memory leaks by limiting the set size
  if (usedIds.size > 10000) {
    // Clear oldest 20% of IDs
    const idsArray = Array.from(usedIds);
    const toRemove = idsArray.slice(0, Math.floor(idsArray.length * 0.2));
    toRemove.forEach(id => usedIds.delete(id));
  }

  return id;
};

/**
 * Generates an ID based on message content for stable identification
 * @param {Object} message - Message object
 * @returns {string} - Content-based ID
 */
export const generateContentBasedId = (message) => {
  if (!message) return generateMessageId();

  try {
    // Create a hash from key message properties
    const content = [
      message.type,
      message.sessionId || message.session_id,
      message.payload?.type,
      message.payload?.properties?.info?.id,
      message.timestamp || message.time
    ].filter(Boolean).join('|');

    // Simple hash function for stable IDs
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    const hashedId = `content_${Math.abs(hash).toString(36)}`;

    // Ensure uniqueness
    if (usedIds.has(hashedId)) {
      return generateMessageId('content_collision');
    }

    usedIds.add(hashedId);
    return hashedId;

  } catch (error) {
    console.warn('Failed to generate content-based ID, using fallback:', error);
    return generateMessageId();
  }
};

/**
 * Resets the ID generator (useful for testing)
 */
export const resetIdGenerator = () => {
  messageCounter = 0;
  usedIds.clear();
};