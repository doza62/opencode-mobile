// Message processing and event management
import { useState, useCallback, useEffect } from 'react';
import { classifyMessage, groupUnclassifiedMessages, groupAllMessages } from '@/features/messaging/utils/messageClassifier';
import { normalizeLoadedMessages, normalizationMetrics } from '@/features/messaging/utils/messageNormalizer';
import { generateMessageId } from '@/features/messaging/utils/messageIdGenerator';
import { apiClient } from '@/services/api/client';

export const useMessageProcessing = () => {
  const [events, setEvents] = useState([]);
  const [unclassifiedMessages, setUnclassifiedMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);

  // Message ID generation is handled by imported utility

  // Load previous messages for session
  const loadMessages = useCallback(async (baseUrl, sessionId, selectedProject = null) => {
    if (!baseUrl || !sessionId) {
      return;
    }

    try {
      console.debug('💬 Loading messages for session:', sessionId);
      const response = await apiClient.get(`${baseUrl}/session/${sessionId}/message?limit=100`, {}, selectedProject);
      const data = await apiClient.parseJSON(response);

      if (data && Array.isArray(data)) {
        console.debug(`📥 Received ${data.length} messages from API`);
        // Start performance monitoring
        const startTime = performance.now();

        // Normalize loaded messages to SSE-compatible structure
        let normalizedMessages;
        try {
          normalizedMessages = normalizeLoadedMessages(data, {
            batchSize: 25, // Smaller batch for better responsiveness
            enableParallel: false, // Keep simple for now
            onProgress: (progress) => {
              console.debug(`🔄 Normalization progress: ${progress.processed}/${progress.total}`);
            },
            onError: (error, batch) => {
              console.warn('⚠️ Batch normalization error:', error, 'Batch size:', batch.length);
            }
          });
          console.debug(`✅ Successfully normalized ${normalizedMessages.length} messages`);
         } catch (normalizationError) {
          console.error('❌ Normalization failed, falling back to raw message processing:', normalizationError);
          // Fallback: use raw messages without normalization
          normalizedMessages = data;
        }

        // Classify normalized messages
        const classifiedMessages = normalizedMessages.map(item => {
          // Ensure sessionId is set for loaded messages
          const classified = classifyMessage(item);
          if (!classified.sessionId) {
            classified.sessionId = sessionId;
          }
          // Ensure unique id for React keys
          if (!classified.id) {
            classified.id = generateMessageId();
          }
          return classified;
        });

        // Record performance metrics
        const processingTime = performance.now() - startTime;
        normalizationMetrics.recordMetrics(
          classifiedMessages.length,
          normalizedMessages.length - classifiedMessages.length, // Errors if any
          processingTime
        );

        console.debug(`💬 Loaded and classified ${classifiedMessages.length} messages in ${processingTime.toFixed(2)}ms`);
        console.debug('📊 Normalization metrics:', normalizationMetrics.getStats());
        console.debug('📋 Sample classified messages:', classifiedMessages.slice(0, 2).map(msg => ({
          type: msg.type,
          category: msg.category,
          hasMessage: !!msg.message,
          sessionId: msg.sessionId
        })));

        setEvents(classifiedMessages);
      }
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
    }
  }, []);

  // Process incoming messages
  const processMessage = useCallback((rawMessage, currentMode) => {
    const classifiedMessage = classifyMessage(rawMessage, currentMode);

    // Track ALL messages for debugging
    setAllMessages(prev => [...prev, classifiedMessage]);

    if (classifiedMessage.category === 'unclassified') {
      setUnclassifiedMessages(prev => [...prev, classifiedMessage]);
    }

    // Add unique ID for UI rendering
    return { ...classifiedMessage, id: classifiedMessage.id || generateMessageId() };
  }, []);

  // Add message to events
  const addEvent = useCallback((message) => {
    setEvents(prev => [...prev, message]);
  }, []);

  // Remove specific event by ID
  const removeEvent = useCallback((eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    setUnclassifiedMessages(prev => prev.filter(event => event.id !== eventId));
    setAllMessages(prev => prev.filter(event => event.id !== eventId));
  }, []);

  // Clear all events
  const clearEvents = useCallback(() => {
    console.debug('🧹 Clearing all messaging events and state');
    setEvents([]);
    setUnclassifiedMessages([]);
    setAllMessages([]);
    // Reset normalization metrics
    normalizationMetrics.reset();
  }, []);

  // Get grouped unclassified messages
  const groupedUnclassifiedMessages = groupUnclassifiedMessages(unclassifiedMessages || []);

  // Get grouped all messages
  const groupedAllMessages = groupAllMessages(allMessages);

  return {
    events,
    unclassifiedMessages,
    allMessages,
    loadMessages,
    processMessage,
    addEvent,
    removeEvent,
    clearEvents,
    groupedUnclassifiedMessages,
    groupedAllMessages
  };
};