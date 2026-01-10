/**
 * Validates if a URL is a valid HTTP or HTTPS URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateUrl = (url) => {
  if (!url || !url.trim()) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate required field
 * @param {*} value - Value to check
 * @returns {boolean} - True if not empty/null/undefined
 */
export const validateRequired = (value) => {
  return value !== null && value !== undefined && String(value).trim().length > 0;
};

/**
 * Validate string length
 * @param {string} str - String to check
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} - True if within range
 */
export const validateLength = (str, min = 0, max = Infinity) => {
  const length = String(str || '').length;
  return length >= min && length <= max;
};
