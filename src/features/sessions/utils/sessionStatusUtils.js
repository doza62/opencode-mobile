/**
 * Utility functions for session status formatting and icons
 */

/**
 * Gets status icon based on session state
 * @param {boolean} isThinking - Whether thinking
 * @param {boolean} isBusy - Whether busy
 * @returns {string} Icon name or path
 */
export const getStatusIcon = (isThinking, isBusy) => {
  if (isBusy) return 'busy-icon';
  if (isThinking) return 'thinking-icon';
  return 'idle-icon';
};

/**
 * Gets animation config for thinking state
 * @returns {Object} Animation config
 */
export const getThinkingAnimation = () => ({
  duration: 1000,
  useNativeDriver: true,
});

/**
 * Formats status text
 * @param {boolean} isThinking - Whether thinking
 * @param {boolean} isBusy - Whether busy
 * @returns {string} Status text
 */
export const formatStatusText = (isThinking, isBusy) => {
  if (isBusy) return 'Busy';
  if (isThinking) return 'Thinking';
  return 'Idle';
};