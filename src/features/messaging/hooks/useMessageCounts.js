/**
 * Hook for calculating message statistics with memoization
 * @param {Object} allMessages - All messages grouped by category
 * @param {Object} unclassifiedMessages - Unclassified messages grouped by type
 * @param {Array} events - Array of all processed events
 * @returns {Object} Memoized statistics object
 */
import { useMemo } from 'react';
import { logger } from '@/shared/services/logger';

const messageLogger = logger.tag('Message');

export const useMessageCounts = (allMessages, unclassifiedMessages, events) => {
  return useMemo(() => {
    // Safe access helpers
    const safeAllMessages = allMessages && typeof allMessages === 'object' ? allMessages : {};
    const safeUnclassified = unclassifiedMessages && typeof unclassifiedMessages === 'object' ? unclassifiedMessages : {};
    const safeEvents = Array.isArray(events) ? events : [];

    let totalAllMessages = 0;
    try {
      totalAllMessages = Object.values(safeAllMessages)
        .flatMap(obj => obj && typeof obj === 'object' ? Object.values(obj) : [])
        .flat().length;
    } catch (error) {
      messageLogger.error('Error calculating totalAllMessages', error);
      totalAllMessages = 0;
    }

    let totalClassifiedMessages = 0;
    try {
      totalClassifiedMessages = Object.values(
        safeAllMessages.classified && typeof safeAllMessages.classified === 'object'
          ? safeAllMessages.classified
          : {}
      ).flat().length;
    } catch (error) {
      messageLogger.error('Error calculating totalClassifiedMessages', error);
      totalClassifiedMessages = 0;
    }

    let totalUnclassifiedMessages = 0;
    try {
      totalUnclassifiedMessages = Object.values(safeUnclassified).flat().length;
    } catch (error) {
      messageLogger.error('Error calculating totalUnclassifiedMessages', error);
      totalUnclassifiedMessages = 0;
    }

    const totalEvents = safeEvents.length;

    return {
      totalAllMessages,
      totalClassifiedMessages,
      totalUnclassifiedMessages,
      totalEvents,
      messageTypesCount: Object.keys(safeAllMessages.classified || {}).length + Object.keys(safeUnclassified).length
    };
  }, [allMessages, unclassifiedMessages, events]);
};