// Data formatting and transformation helpers

/**
 * Format timestamp to readable date string
 * @param {number} timestamp - Unix timestamp
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string
 */
export const formatTimestamp = (timestamp, options = {}) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (options.relative && diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (options.relative && diffDays === 1) {
    return 'Yesterday';
  } else if (options.relative && diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString();
};

import { Text } from 'react-native';

/**
 * OpenCode formatting utilities
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Format file size in human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert camelCase to Title Case
 * @param {string} str - camelCase string
 * @returns {string} - Title Case string
 */
export const camelToTitle = (str) => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
};

/**
 * Get project display name from worktree path
 * @param {string} worktree - Worktree path
 * @returns {string} - Display name
 */
export const getProjectDisplayName = (worktree) => {
  if (!worktree) return 'Unknown Project';

  // Extract last part of path
  const parts = worktree.split('/').filter(part => part.trim().length > 0);
  return parts.length > 0 ? parts[parts.length - 1] : 'Unknown Project';
};

/**
 * Get session summary text for display
 * @param {import('../types/opencode.types.js').Session} session - Session object
 * @returns {string} - Summary text
 */
export const getSessionSummaryText = (session) => {
  if (!session.summary) return '';

  const { additions, deletions, files } = session.summary;
  const parts = [];

  if (additions > 0) parts.push(`+${additions}`);
  if (deletions > 0) parts.push(`-${deletions}`);
  if (files > 0) parts.push(`${files} files`);

  return parts.length > 0 ? ` (${parts.join(', ')})` : '';
};

export const getColoredSessionSummary = (session, theme) => {
  if (!session.summary) return null;

  const { additions, deletions, files } = session.summary;
  const parts = [];

  if (additions > 0) parts.push(
    <Text key="add" style={{ color: theme.colors.success }}>
      +{additions}
    </Text>
  );
  if (deletions > 0) parts.push(
    <Text key="del" style={{ color: theme.colors.error }}>
      -{deletions}
    </Text>
  );
  if (files > 0) parts.push(
    <Text key="files" style={{ color: theme.colors.textSecondary }}>
      {files} files
    </Text>
  );

  return parts.length > 0 ? (
    <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
      {' ('}
      {parts.reduce((acc, part, i) =>
        i === 0 ? [part] : [...acc, <Text key={`sep-${i}`}>, </Text>, part], []
      )}
      {')'}
    </Text>
  ) : null;
};

/**
 * Format session timestamp for display
 * @param {number} timestamp - Unix timestamp
 * @returns {string} - Formatted date string
 */
export const formatSessionDate = (timestamp) => {
  return formatTimestamp(timestamp, { relative: true });
};