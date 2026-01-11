/**
 * Unified Message Processor
 * 
 * Merges SSE and Historical pre-processed messages into a single displayable format.
 * Handles message ordering, deduplication, and display formatting.
 * 
 * Architecture:
 *   SSE Pre-processor → Unified Processor → Display Components
 *   Historical Pre-processor ↗
 */
import { logger } from '@/shared/services/logger';

const displayLogger = logger.tag('MessageDisplayProcessor');

/**
 * Merges SSE and historical messages with proper ordering
 * @param {Array} sseMessages - Pre-processed SSE messages
 * @param {Array} historicalMessages - Pre-processed historical messages  
 * @param {Object} options - Merge options
 * @returns {Object} - Merged result with displayMessages and metadata
 */
export const mergeMessages = (sseMessages = [], historicalMessages = [], options = {}) => {
  const { 
    dedupBy = 'messageId', 
    sortBy = 'timestamp',
    preferSSE = true // SSE messages take precedence when duplicates found
  } = options;

  // Combine all messages
  const allMessages = [
    ...historicalMessages.map(msg => ({ ...msg, _source: 'historical' })),
    ...sseMessages.map(msg => ({ ...msg, _source: 'sse' }))
  ];

  // Deduplicate
  const deduped = deduplicateMessages(allMessages, dedupBy, preferSSE);

  // Sort by timestamp
  const sorted = sortMessages(deduped, sortBy);

  // Mark the last message (most recent) as the "current" one for special styling
  if (sorted.length > 0) {
    sorted[sorted.length - 1]._isLastMessage = true;
  }

  // Group by conversation
  const grouped = groupForDisplay(sorted);

  displayLogger.debug('Messages merged', {
    sseCount: sseMessages.length,
    historicalCount: historicalMessages.length,
    finalCount: sorted.length,
    groups: Object.keys(grouped)
  });

  return {
    messages: sorted,
    grouped,
    metadata: {
      totalCount: sorted.length,
      sseCount: sseMessages.length,
      historicalCount: historicalMessages.length,
      deduplicated: allMessages.length - sorted.length
    }
  };
};

/**
 * Deduplicates messages based on messageId
 */
const deduplicateMessages = (messages, key, preferSSE) => {
  const seen = new Map();
  const result = [];

  messages.forEach(msg => {
    const id = msg[key] || msg.id;
    if (!id) {
      result.push(msg);
      return;
    }

    if (seen.has(id)) {
      const existing = seen.get(id);
      
      // SSE takes precedence over historical
      if (preferSSE && msg._source === 'sse') {
        const index = result.indexOf(existing);
        if (index >= 0) {
          result[index] = mergeMessageData(existing, msg);
          seen.set(id, result[index]);
          displayLogger.debug('Replaced historical with SSE', { messageId: id });
        }
      }
      // Otherwise keep existing (historical)
    } else {
      seen.set(id, msg);
      result.push(msg);
    }
  });

  return result;
};

/**
 * Merges data from two messages, preferring newer values
 */
const mergeMessageData = (existing, incoming) => {
  return {
    ...existing,
    ...incoming,
    // Keep the earlier timestamp (original creation time)
    timestamp: existing.timestamp || incoming.timestamp,
    // Mark as merged
    _merged: true,
    _mergedAt: Date.now()
  };
};

/**
 * Sorts messages by timestamp
 */
const sortMessages = (messages, sortBy) => {
  return [...messages].sort((a, b) => {
    const aTime = a[sortBy] || a.createdAt || 0;
    const bTime = b[sortBy] || b.createdAt || 0;
    return aTime - bTime;
  });
};

/**
 * Groups messages for display (by session, then chronological)
 */
const groupForDisplay = (messages) => {
  const groups = {
    all: messages,
    bySession: {},
    byRole: { user: [], assistant: [], system: [] },
    byType: {}
  };

  messages.forEach(msg => {
    // By session
    const sessionId = msg.sessionId || 'unknown';
    if (!groups.bySession[sessionId]) {
      groups.bySession[sessionId] = [];
    }
    groups.bySession[sessionId].push(msg);

    // By role
    const role = msg.role || 'system';
    if (groups.byRole[role]) {
      groups.byRole[role].push(msg);
    }

    // By type
    const type = msg.type;
    if (!groups.byType[type]) {
      groups.byType[type] = [];
    }
    groups.byType[type].push(msg);
  });

  return groups;
};

/**
 * Formats a single message for UI display
 * @param {Object} message - Pre-processed message
 * @param {Object} options - Display options
 * @returns {Object} - Display-ready message object
 */
export const formatMessageForDisplay = (message, options = {}) => {
  const {
    showTimestamps = true,
    showRole = true,
    maxLength = null,
    truncateMode = 'end'
  } = options;

  // Determine display text
  let displayText = message.text || message.message || '';
  
  // Truncate if needed
  if (maxLength && displayText.length > maxLength) {
    if (truncateMode === 'end') {
      displayText = displayText.substring(0, maxLength) + '...';
    } else if (truncateMode === 'middle') {
      const half = Math.floor(maxLength / 2);
      displayText = displayText.substring(0, half) + '...' + displayText.substring(displayText.length - half);
    }
  }

  // Get category for styling
  const category = getMessageCategory(message);

  // Determine icon based on type and role
  const icon = getDisplayIcon(message);

  // Format timestamp
  const timestamp = message.timestamp 
    ? new Date(message.timestamp).toLocaleTimeString()
    : null;

  return {
    // Display properties
    id: message.id || message.messageId,
    displayText,
    displayRole: showRole ? formatRole(message.role) : null,
    displayTimestamp: timestamp,
    displayIcon: icon,
    
    // Content
    text: displayText,
    reasoning: message.reasoning || null,
    parts: message.parts || [],
    
    // Metadata
    messageId: message.messageId,
    sessionId: message.sessionId,
    type: message.type,
    role: message.role,
    mode: message.mode,
    agent: message.agent,
    
    // Styling category (for UI to use different backgrounds)
    displayCategory: category.category,
    hasReasoning: category.hasReasoning,
    isLastMessage: message._isLastMessage || false,
    
    // Source info (for debugging)
    source: message.source || message._source,
    isComplete: message.isComplete !== false,
    isPartial: message.isPartial || false,
    
    // Error state
    error: message.error || null,
    
    // Raw data (optional, for debug views)
    ...(options.includeRaw && { rawData: message.rawData || message })
  };
};

/**
 * Determines the display category for a message based on its properties
 * @param {Object} message - Pre-processed message
 * @returns {Object} - Category info for styling (category, priority, hasReasoning)
 */
export const getMessageCategory = (message) => {
  const hasReasoning = !!(message.reasoning || message.parts?.some(p => p.type === 'reasoning'));
  const hasText = !!(message.text || message.parts?.some(p => p.type === 'text' || p.type === 'output'));
  const isError = !!(message.error || message.type === 'error');

  // Priority 1: Error messages
  if (isError) {
    return { category: 'error', priority: 0, hasReasoning: false };
  }

  // Priority 2: Last message gets special highlighting
  if (message._isLastMessage) {
    return { category: 'last-message', priority: 1, hasReasoning };
  }

  // Priority 3: Messages with reasoning content
  if (hasReasoning) {
    return { category: 'reasoning', priority: 2, hasReasoning: true };
  }

  // Priority 4: Regular messages
  if (hasText) {
    return { category: 'regular', priority: 3, hasReasoning: false };
  }

  // Fallback: other
  return { category: 'other', priority: 4, hasReasoning: false };
};

/**
 * Gets display icon based on message properties
 */
const getDisplayIcon = (message) => {
  // Error icon
  if (message.error || message.type === 'error') {
    return '❌';
  }

  // Partial/streaming indicator
  if (message.isPartial || message.type === 'partial_message') {
    return message.partType === 'reasoning' ? '🤔' : '📝';
  }

  // Role-based icons
  switch (message.role) {
    case 'user':
      return '👤';
    case 'assistant':
    case 'agent':
      return '🤖';
    case 'system':
      return '⚙️';
    default:
      return '💬';
  }
};

/**
 * Formats role for display
 */
const formatRole = (role) => {
  const roleLabels = {
    'user': 'You',
    'assistant': 'Assistant',
    'agent': 'Agent',
    'system': 'System'
  };
  return roleLabels[role] || role;
};

/**
 * Filters messages for display based on criteria
 * @param {Array} messages - All messages
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered messages
 */
export const filterMessagesForDisplay = (messages, filters = {}) => {
  const {
    role = null,
    type = null,
    sessionId = null,
    searchText = null,
    includePartial = false
  } = filters;

  return messages.filter(msg => {
    // Filter by role
    if (role && msg.role !== role) {
      return false;
    }

    // Filter by type
    if (type && msg.type !== type) {
      return false;
    }

    // Filter by session
    if (sessionId && msg.sessionId !== sessionId) {
      return false;
    }

    // Filter partial messages (unless explicitly included)
    if (!includePartial && msg.isPartial) {
      return false;
    }

    // Filter by search text
    if (searchText) {
      const text = (msg.text || '').toLowerCase();
      const search = searchText.toLowerCase();
      if (!text.includes(search)) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Creates display statistics for a message list
 * @param {Array} messages - All messages
 * @returns {Object} - Statistics object
 */
export const getMessageStatistics = (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      total: 0,
      byRole: {},
      byType: {},
      totalTextLength: 0,
      averageTextLength: 0
    };
  }

  const byRole = {};
  const byType = {};
  let totalTextLength = 0;

  messages.forEach(msg => {
    // Count by role
    const role = msg.role || 'unknown';
    byRole[role] = (byRole[role] || 0) + 1;

    // Count by type
    const type = msg.type || 'unknown';
    byType[type] = (byType[type] || 0) + 1;

    // Text length
    const textLen = (msg.text || '').length;
    totalTextLength += textLen;
  });

  return {
    total: messages.length,
    byRole,
    byType,
    totalTextLength,
    averageTextLength: Math.round(totalTextLength / messages.length),
    hasPartialMessages: messages.some(m => m.isPartial),
    hasErrors: messages.some(m => m.error)
  };
};
