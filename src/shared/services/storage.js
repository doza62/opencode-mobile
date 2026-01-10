// AsyncStorage wrapper with error handling and type safety
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/shared/services/logger';

const storageLogger = logger.tag('Storage');

/**
 * Storage service for persistent data
 */
export const storage = {
  /**
   * Get item from storage
   * @param {string} key - Storage key
   * @returns {Promise<any>} - Parsed value or null
   */
  async get(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      storageLogger.error('Storage get error', { key, error: error.message });
      return null;
    }
  },

  /**
   * Set item in storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {Promise<void>}
   */
  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      storageLogger.error('Storage set error', { key, error: error.message });
      throw error;
    }
  },

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      storageLogger.error('Storage remove error', { key, error: error.message });
      throw error;
    }
  },

  /**
   * Clear all storage
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      storageLogger.error('Storage clear error', error);
      throw error;
    }
  },

  /**
   * Get all keys
   * @returns {Promise<string[]>} - Array of keys
   */
  async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      storageLogger.error('Storage getAllKeys error', error);
      return [];
    }
  },

  /**
   * Multi-get items
   * @param {string[]} keys - Array of keys
   * @returns {Promise<Array<[string, string|null]>>} - Key-value pairs
   */
  async multiGet(keys) {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      storageLogger.error('Storage multiGet error', error);
      return [];
    }
  },

  /**
   * Multi-set items
   * @param {Array<[string, any]>} keyValuePairs - Key-value pairs
   * @returns {Promise<void>}
   */
  async multiSet(keyValuePairs) {
    try {
      const stringPairs = keyValuePairs.map(([key, value]) => [key, JSON.stringify(value)]);
      await AsyncStorage.multiSet(stringPairs);
    } catch (error) {
      storageLogger.error('Storage multiSet error', error);
      throw error;
    }
  }
};