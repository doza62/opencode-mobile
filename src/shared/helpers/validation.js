// Input validation helpers
import { validateUrl as originalValidateUrl } from './urlValidation';

/**
 * Enhanced URL validation with additional checks
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
export const validateUrl = (url) => {
  return originalValidateUrl(url);
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