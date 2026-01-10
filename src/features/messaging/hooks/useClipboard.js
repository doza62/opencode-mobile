/**
 * Hook for clipboard operations with error handling
 * @returns {Object} Clipboard utility functions
 */
import { useCallback } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';
import { logger } from '@/shared/services/logger';

const clipboardLogger = logger.tag('Clipboard');

export const useClipboard = () => {
  const copyToClipboard = useCallback(async (content, label = 'content') => {
    try {
      await Clipboard.setStringAsync(content);
      Alert.alert('Copied!', `${label} copied to clipboard`);
      return true;
    } catch (error) {
      clipboardLogger.error('Clipboard copy failed', error);
      Alert.alert('Error', 'Failed to copy to clipboard');
      return false;
    }
  }, []);

  const copyToClipboardAsync = useCallback(async (content, label = 'content') => {
    try {
      await Clipboard.setStringAsync(content);
      return { success: true, label };
    } catch (error) {
      clipboardLogger.error('Clipboard copy failed', error);
      return { success: false, error: error.message, label };
    }
  }, []);

  return {
    copyToClipboard,
    copyToClipboardAsync
  };
};