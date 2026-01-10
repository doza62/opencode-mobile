// Model preference storage utilities
import { storage } from '@/shared/services/storage';
import { STORAGE_KEYS } from '@/shared/constants/storage';
import { logger } from '@/shared/services/logger';

const modelLogger = logger.tag('Model');

/**
 * Save the last selected model to storage
 * @param {string} providerId - Provider ID
 * @param {string} modelId - Model ID
 */
export const saveLastSelectedModel = async (providerId, modelId) => {
  const modelData = {
    providerId,
    modelId,
    timestamp: Date.now()
  };
  await storage.set(STORAGE_KEYS.LAST_SELECTED_MODEL, modelData);
  modelLogger.debug('Saved last selected model', { providerId, modelId });
};

/**
 * Load the last selected model from storage
 * @returns {Promise<Object|null>} - Last selected model or null
 */
export const loadLastSelectedModel = async () => {
  const modelData = await storage.get(STORAGE_KEYS.LAST_SELECTED_MODEL);
  if (modelData) {
    modelLogger.debug('Loaded last selected model', { providerId: modelData.providerId, modelId: modelData.modelId });
    return modelData;
  }
  return null;
};