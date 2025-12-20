/**
 * Message classification utility for opencode SSE messages
 * @param {import('./opencode-types.js').GlobalEvent} item - The SSE message item to classify
 * @returns {Object} - Classified message with metadata
 */
export const classifyMessage = (item) => {
  if (!item || !item.payload) {
    return {
      type: 'unknown',
      category: 'unclassified',
      projectName: 'Unknown Project',
      displayMessage: JSON.stringify(item, null, 2),
      rawData: item,
      icon: '❓'
    };
  }

  const { directory, payload } = item;
  const { type, properties } = payload;

  // Extract project name from directory path
  const projectName = extractProjectName(directory);

  // Classify by payload.type
  let classification;
  let icon;
  let category;

  if (type === 'message.updated') {
    classification = 'finalized';
    icon = '✅';
    category = 'message';
  } else if (type === 'message.part.updated') {
    classification = 'streaming';
    icon = '📝';
    category = 'message';
  } else if (type.startsWith('session.')) {
    classification = 'session';
    icon = '🔄';
    category = 'session';
  } else {
    classification = 'unclassified';
    icon = '⚠️';
    category = 'unclassified';
  }

  // Format display message
  const displayMessage = formatClassifiedMessage(item, projectName, classification, icon);

  return {
    type: classification,
    category,
    projectName,
    displayMessage,
    rawData: item,
    icon,
    payloadType: type,
    info: properties?.info || null
  };
};

/**
 * Extract project name from directory path
 * @param {string} directory - Directory path
 * @returns {string} - Project name
 */
export const extractProjectName = (directory) => {
  if (!directory || typeof directory !== 'string') {
    return 'Unknown Project';
  }

  // Split by '/' and get last non-empty part
  const parts = directory.split('/').filter(part => part.trim().length > 0);
  return parts.length > 0 ? parts[parts.length - 1] : 'Unknown Project';
};

/**
 * Format message for display with classification
 * @param {Object} item - Raw message item
 * @param {string} projectName - Extracted project name
 * @param {string} classification - Message classification
 * @param {string} icon - Display icon
 * @returns {string} - Formatted display message
 */
const formatClassifiedMessage = (item, projectName, classification, icon) => {
  const { payload } = item;
  const { type, properties } = payload;
  const { info } = properties || {};

  if (!info) {
    return `${icon} ${classification.toUpperCase()}\n📁 ${projectName}\n📝 ${type}\n⚠️ Missing info data`;
  }

  const { role, agent, id } = info;

  return `${icon} ${classification.toUpperCase()}\n📁 ${projectName}\n📝 ${type}\n👤 ${role} (${agent})\n💬 ${id}`;
};

/**
 * Group unclassified messages by type for debugging
 * @param {Array} messages - Array of classified messages
 * @returns {Object} - Grouped messages by type
 */
export const groupUnclassifiedMessages = (messages) => {
  const grouped = {};

  messages.forEach(message => {
    if (message.category === 'unclassified') {
      const type = message.payloadType || 'unknown';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(message);
    }
  });

  return grouped;
};