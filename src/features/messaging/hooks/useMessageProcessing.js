import { useState, useCallback } from 'react';
import { classifyMessage, groupUnclassifiedMessages, groupAllMessages } from '@/features/messaging/utils/messageClassifier';
import { normalizeLoadedMessages, normalizationMetrics } from '@/features/messaging/utils/messageNormalizer';
import { preprocessHistoricalMessages } from '@/features/messaging/utils/messageProcessors';
import { generateMessageId } from '@/features/messaging/utils/messageIdGenerator';
import { apiClient } from '@/shared/services/api/client';
import { getProjectDisplayName } from '@/shared/helpers/formatting';
import { logger } from '@/shared/services/logger';
import { MESSAGE_LIMITS } from '@/shared/constants';
import { useMessageStore } from './useMessageStore';

const messageLogger = logger.tag('Message');

const OLDER_MESSAGES_LIMIT = 20;
const DISPLAY_OLDER_MESSAGES = 10;

export const useMessageProcessing = () => {
  const [events, setEvents] = useState([]);
  const [unclassifiedMessages, setUnclassifiedMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [olderMessagesBuffer, setOlderMessagesBuffer] = useState([]);
  const [oldestLoadedMessageId, setOldestLoadedMessageId] = useState(null);

  const messageStore = useMessageStore();

  const loadMessages = useCallback(async (baseUrl, sessionId, selectedProject = null) => {
    if (!baseUrl || !sessionId) {
      return;
    }

    try {
      messageLogger.debug('Loading messages for session', { sessionId });
      const response = await apiClient.get(`${baseUrl}/session/${sessionId}/message?limit=${OLDER_MESSAGES_LIMIT}`, {}, selectedProject);
      const data = await apiClient.parseJSON(response);

      if (data && Array.isArray(data)) {
        messageLogger.debug('Received messages from API', { count: data.length });

        const startTime = performance.now();

        let normalizedMessages;
        try {
          // Use new preprocessor for historical messages (handles parts.content field correctly)
          normalizedMessages = preprocessHistoricalMessages(data, {
            sessionId,
            projectName: selectedProject?.name || selectedProject?.path || getProjectDisplayName(selectedProject?.directory)
          });
          messageLogger.debug('Message preprocessing complete', { count: normalizedMessages.length });
        } catch (normalizationError) {
          messageLogger.error('Preprocessing failed, falling back to raw messages', normalizationError);
          normalizedMessages = normalizeLoadedMessages(data, {
            batchSize: 25,
            enableParallel: false,
          });
          messageLogger.debug('Fell back to legacy normalization', { count: normalizedMessages.length });
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

          // Bridge: new preprocessor uses 'text', legacy expects 'message'
          if (item.text && !classified.message) {
            classified.message = item.text;
          }
          // Bridge: preserve reasoning from new preprocessor
          if (item.reasoning) {
            classified.reasoning = item.reasoning;
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
        // Set the oldest message ID for pagination
        if (classifiedMessages.length > 0) {
          setOldestLoadedMessageId(classifiedMessages[0]?.messageId || classifiedMessages[0]?.id);
        }
      }
    } catch (error) {
      messageLogger.error('Failed to load messages', error);
    }
  }, [messageStore]);

  const loadOlderMessages = useCallback(async (baseUrl, sessionId, selectedProject = null, beforeMessageId = null) => {
    // Check buffer first - consume from buffer if available
    if (olderMessagesBuffer.length > 0) {
      consumeFromBuffer();
      return [];
    }

    if (!baseUrl || !sessionId) {
      return [];
    }

    // Use the oldest loaded message ID as the boundary
    const before = oldestLoadedMessageId || beforeMessageId;
    if (!before) {
      messageLogger.debug('No before message ID available for pagination');
      return [];
    }

    try {
      messageLogger.debug('Loading older messages', { sessionId, before, limit: OLDER_MESSAGES_LIMIT });
      const response = await apiClient.get(`${baseUrl}/session/${sessionId}/message?limit=${OLDER_MESSAGES_LIMIT}&before=${before}`, {}, selectedProject);
      const data = await apiClient.parseJSON(response);

      if (data && Array.isArray(data) && data.length > 0) {
        messageLogger.debug('Received older messages from API', { count: data.length });

        const startTime = performance.now();

        let normalizedMessages;
        try {
          normalizedMessages = preprocessHistoricalMessages(data, {
            sessionId,
            projectName: selectedProject?.name || selectedProject?.path || getProjectDisplayName(selectedProject?.directory)
          });
          messageLogger.debug('Older messages preprocessing complete', { count: normalizedMessages.length });
        } catch (normalizationError) {
          messageLogger.error('Preprocessing failed for older messages, falling back', normalizationError);
          normalizedMessages = normalizeLoadedMessages(data, {
            batchSize: 25,
            enableParallel: false,
          });
        }

        const seenMessageIds = new Set();
        const classifiedMessages = [];

        normalizedMessages.forEach(item => {
          const classified = classifyMessage(item);
          if (!classified.sessionId) {
            classified.sessionId = sessionId;
          }
          if (selectedProject && !classified.projectName) {
            classified.projectName = selectedProject.name || selectedProject.path || getProjectDisplayName(selectedProject?.directory) || 'Unknown Project';
          }
          if (!classified.id) {
            classified.id = classified.messageId || generateMessageId();
          }

          if (item.text && !classified.message) {
            classified.message = item.text;
          }
          if (item.reasoning) {
            classified.reasoning = item.reasoning;
          }

          if (classified.messageId) {
            if (seenMessageIds.has(classified.messageId)) {
              messageLogger.debug('Skipping duplicate older message', { messageId: classified.messageId });
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
        messageLogger.debug('Older messages loaded and classified', {
          count: classifiedMessages.length,
          duration: `${processingTime.toFixed(2)}ms`
        });

        return classifiedMessages;
      }

      messageLogger.debug('No more older messages available');
      return [];
    } catch (error) {
      messageLogger.error('Failed to load older messages', error);
      return [];
    }
  }, [messageStore]);

  const prependOlderMessages = useCallback((olderMessages) => {
    // Only prepend the oldest 10, keep newer ones as buffer
    const toPrepend = olderMessages.slice(0, DISPLAY_OLDER_MESSAGES);
    const buffered = olderMessages.slice(DISPLAY_OLDER_MESSAGES);

    if (buffered.length > 0) {
      setOlderMessagesBuffer(prev => [...buffered, ...prev]);
    }

    setEvents(prev => [...toPrepend, ...prev]);
    messageLogger.debug('Prepended older messages', { displayed: toPrepend.length, buffered: buffered.length });

    // Update pagination boundary to the oldest message
    if (olderMessages.length > 0) {
      setOldestLoadedMessageId(olderMessages[0]?.messageId || olderMessages[0]?.id);
    }

    return olderMessages[0]?.messageId || olderMessages[0]?.id;
  }, []);

  const consumeFromBuffer = useCallback(() => {
    setOlderMessagesBuffer(prev => {
      if (prev.length === 0) return prev;

      const toPrepend = prev.slice(0, DISPLAY_OLDER_MESSAGES);
      const remaining = prev.slice(DISPLAY_OLDER_MESSAGES);

      setEvents(existing => [...toPrepend, ...existing]);
      messageLogger.debug('Consumed from buffer', { displayed: toPrepend.length, remaining: remaining.length });

      return remaining;
    });
  }, []);

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
    loadOlderMessages,
    prependOlderMessages,
    consumeFromBuffer,
    hasOlderMessagesBuffer: olderMessagesBuffer.length > 0,
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
