import { useState, useCallback } from 'react';
import { classifyMessage, groupUnclassifiedMessages, groupAllMessages } from '@/features/messaging/utils/messageClassifier';
import { normalizeLoadedMessages, normalizationMetrics } from '@/features/messaging/utils/messageNormalizer';
import { generateMessageId } from '@/features/messaging/utils/messageIdGenerator';
import { apiClient } from '@/shared/services/api/client';
import { getProjectDisplayName } from '@/shared/helpers/formatting';
import { logger } from '@/shared/services/logger';
import { MESSAGE_LIMITS } from '@/shared/constants';
import { useMessageStore } from './useMessageStore';

const messageLogger = logger.tag('Message');

export const useMessageProcessing = () => {
  const [events, setEvents] = useState([]);
  const [unclassifiedMessages, setUnclassifiedMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);

  const messageStore = useMessageStore();

  const loadMessages = useCallback(async (baseUrl, sessionId, selectedProject = null) => {
    if (!baseUrl || !sessionId) {
      return;
    }

    try {
      messageLogger.debug('Loading messages for session', { sessionId });
      const response = await apiClient.get(`${baseUrl}/session/${sessionId}/message?limit=${MESSAGE_LIMITS.SESSION_MESSAGES}`, {}, selectedProject);
      const data = await apiClient.parseJSON(response);

      if (data && Array.isArray(data)) {
        messageLogger.debug('Received messages from API', { count: data.length });

        const startTime = performance.now();

        let normalizedMessages;
        try {
          normalizedMessages = normalizeLoadedMessages(data, {
            batchSize: 25,
            enableParallel: false,
            onProgress: (progress) => {
              messageLogger.debugCtx('MESSAGE_PROCESSING', `Normalization progress: ${progress.processed}/${progress.total}`);
            },
            onError: (error, batch) => {
              messageLogger.warn('Batch normalization error', { error: error.message, batchSize: batch.length });
            }
          });
          messageLogger.debug('Message normalization complete', { count: normalizedMessages.length });
        } catch (normalizationError) {
          messageLogger.error('Normalization failed, falling back to raw messages', normalizationError);
          normalizedMessages = data;
        }

        const seenMessageIds = new Set();
        const classifiedMessages = [];

        normalizedMessages.forEach(item => {
          const classified = classifyMessage(item);
          if (!classified.sessionId) {
            classified.sessionId = sessionId;
          }
          if (selectedProject && !classified.projectName) {
            classified.projectName = selectedProject.name || selectedProject.path || getProjectDisplayName(selectedProject.directory) || 'Unknown Project';
          }
          if (!classified.id) {
            classified.id = classified.messageId || generateMessageId();
          }

          if (classified.messageId) {
            if (seenMessageIds.has(classified.messageId)) {
              messageLogger.debug('Skipping duplicate message in load', { messageId: classified.messageId });
              return;
            }
            seenMessageIds.add(classified.messageId);

            messageStore.finalizeMessage(classified.messageId, {
              role: classified.role,
              message: classified.message,
              sessionId: classified.sessionId,
              projectName: classified.projectName,
              mode: classified.mode,
              rawData: classified.rawData,
            });
          }

          classifiedMessages.push(classified);
        });

        const processingTime = performance.now() - startTime;
        normalizationMetrics.recordMetrics(
          classifiedMessages.length,
          normalizedMessages.length - classifiedMessages.length,
          processingTime
        );

        const stats = normalizationMetrics.getStats();
        messageLogger.debug('Messages loaded and classified', {
          count: classifiedMessages.length,
          duration: `${processingTime.toFixed(2)}ms`,
          normalizationStats: stats
        });

        setEvents(classifiedMessages);
      }
    } catch (error) {
      messageLogger.error('Failed to load messages', error);
    }
  }, [messageStore]);

  const assemblePartialMessages = useCallback((messageId) => {
    return messageStore.assembleMessageText(messageId);
  }, [messageStore]);

  const processMessage = useCallback((rawMessage, currentMode) => {
    const classifiedMessage = classifyMessage(rawMessage, currentMode);

    if (!classifiedMessage) {
      return null;
    }

    if (classifiedMessage.type === 'partial_message' && classifiedMessage.messageId) {
      const { messageId, partId, partType, text, delta } = classifiedMessage;

      messageStore.addPart(messageId, {
        partId,
        partType,
        text,
        delta,
      });

      messageLogger.debug('Accumulated partial message via store', {
        messageId,
        partType,
        textLength: text?.length || 0
      });

      const debugMessage = {
        ...classifiedMessage,
        id: generateMessageId(),
        isPartial: true
      };
      setAllMessages(prev => [...prev, debugMessage]);

      return debugMessage;
    }

    if (classifiedMessage.type === 'message_finalized') {
      messageStore.finalizeMessage(classifiedMessage.messageId, {
        role: classifiedMessage.role,
        message: classifiedMessage.message,
        sessionId: classifiedMessage.sessionId,
        projectName: classifiedMessage.projectName,
        mode: classifiedMessage.mode,
        rawData: classifiedMessage.rawData,
      });

      if (classifiedMessage.assembledFromParts) {
        const assembledText = messageStore.assembleMessageText(classifiedMessage.messageId);

        if (assembledText) {
          classifiedMessage.message = assembledText;
          classifiedMessage.assembledFromParts = false;
          classifiedMessage.assembledAt = Date.now();

          messageLogger.debug('Assembled message from parts via store', {
            messageId: classifiedMessage.messageId,
            assembledLength: assembledText.length,
            role: classifiedMessage.role,
          });
        }
      }

      if (classifiedMessage.message) {
        setAllMessages(prev => [...prev, classifiedMessage]);
      } else {
        messageLogger.debug('Not adding to allMessages - no content yet', {
          messageId: classifiedMessage.messageId,
          hasParts: classifiedMessage.assembledFromParts,
        });
      }
    } else {
      setAllMessages(prev => [...prev, classifiedMessage]);
    }

    if (classifiedMessage.category === 'unclassified') {
      setUnclassifiedMessages(prev => [...prev, classifiedMessage]);
    }

    return { ...classifiedMessage, id: classifiedMessage.id || generateMessageId() };
  }, [messageStore]);

  const addEvent = useCallback((message) => {
    setEvents(prev => {
      if (message.messageId) {
        const existingIndex = prev.findIndex(e => e.messageId === message.messageId);
        if (existingIndex >= 0) {
          messageLogger.debug('Updating existing message by messageId', {
            messageId: message.messageId,
            type: message.type,
          });
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...message };
          return updated;
        }
      }
      return [...prev, message];
    });
  }, []);

  const removeEvent = useCallback((eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    setUnclassifiedMessages(prev => prev.filter(event => event.id !== eventId));
    setAllMessages(prev => prev.filter(event => event.id !== eventId));
  }, []);

  const clearEvents = useCallback(() => {
    messageLogger.debug('Clearing all messaging events and state');
    setEvents([]);
    setUnclassifiedMessages([]);
    setAllMessages([]);
    messageStore.clearStore();
    normalizationMetrics.reset();
  }, [messageStore]);

  const groupedUnclassifiedMessages = groupUnclassifiedMessages(unclassifiedMessages || []);
  const groupedAllMessages = groupAllMessages(allMessages);

  return {
    events,
    unclassifiedMessages,
    allMessages,
    messageStore: messageStore.messageStore,
    assemblePartialMessages,
    loadMessages,
    processMessage,
    addEvent,
    removeEvent,
    clearEvents,
    groupedUnclassifiedMessages,
    groupedAllMessages,
    getMessageByApiId: messageStore.getMessage,
    getMessagesByRole: messageStore.getMessagesByRole,
  };
};
