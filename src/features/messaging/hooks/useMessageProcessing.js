// Message processing and event management
import { useState, useCallback } from 'react';
import { classifyMessage, groupUnclassifiedMessages } from '../utils/messageClassifier';

export const useMessageProcessing = () => {
  const [events, setEvents] = useState([]);
  const [unclassifiedMessages, setUnclassifiedMessages] = useState([]);

  // Generate unique message IDs
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  // Process incoming messages
  const processMessage = useCallback((rawMessage, currentMode) => {
    const classifiedMessage = classifyMessage(rawMessage, currentMode);

    if (classifiedMessage.category === 'unclassified') {
      setUnclassifiedMessages(prev => [...prev, classifiedMessage]);
    }

    // Add unique ID for UI rendering
    return { ...classifiedMessage, id: classifiedMessage.id || generateMessageId() };
  }, [generateMessageId]);

  // Add message to events
  const addEvent = useCallback((message) => {
    setEvents(prev => [...prev, message]);
  }, []);

  // Clear all events
  const clearEvents = useCallback(() => {
    setEvents([]);
    setUnclassifiedMessages([]);
  }, []);

  // Get grouped unclassified messages
  const groupedUnclassifiedMessages = groupUnclassifiedMessages(unclassifiedMessages);

  return {
    events,
    unclassifiedMessages,
    groupedUnclassifiedMessages,
    processMessage,
    addEvent,
    clearEvents,
    generateMessageId
  };
};