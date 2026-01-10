import { useState, useCallback, useRef } from 'react';
import { logger } from '@/shared/services/logger';

const storeLogger = logger.tag('MessageStore');

export const useMessageStore = () => {
  const [messageStore, setMessageStore] = useState({});
  const storeRef = useRef({});

  const getOrCreateMessage = useCallback((messageId, initialData = {}) => {
    if (!messageId) {
      storeLogger.warn('getOrCreateMessage called without messageId');
      return null;
    }

    setMessageStore(prev => {
      if (prev[messageId]) {
        return prev;
      }

      const newEntry = {
        messageId,
        sessionId: initialData.sessionId || null,
        role: initialData.role || null,
        parts: [],
        finalized: false,
        finalizedMessage: null,
        projectName: initialData.projectName || null,
        mode: initialData.mode || 'build',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        rawFinalizedData: null,
      };

      storeLogger.debug('Created new message entry', { messageId });
      const updated = { ...prev, [messageId]: newEntry };
      storeRef.current = updated;
      return updated;
    });

    return storeRef.current[messageId] || null;
  }, []);

  const addPart = useCallback((messageId, part) => {
    if (!messageId || !part) {
      storeLogger.warn('addPart called with invalid params', { messageId, hasPart: !!part });
      return;
    }

    setMessageStore(prev => {
      const existingEntry = prev[messageId] || {
        messageId,
        sessionId: null,
        role: null,
        parts: [],
        finalized: false,
        finalizedMessage: null,
        projectName: null,
        mode: 'build',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        rawFinalizedData: null,
      };

      const existingPartIndex = existingEntry.parts.findIndex(p => p.partId === part.partId);
      let updatedParts;

      if (existingPartIndex >= 0) {
        updatedParts = [...existingEntry.parts];
        updatedParts[existingPartIndex] = {
          ...updatedParts[existingPartIndex],
          ...part,
          timestamp: part.timestamp || Date.now(),
        };
      } else {
        updatedParts = [...existingEntry.parts, {
          ...part,
          timestamp: part.timestamp || Date.now(),
        }];
      }

      const updated = {
        ...prev,
        [messageId]: {
          ...existingEntry,
          parts: updatedParts,
          updatedAt: Date.now(),
        },
      };

      storeRef.current = updated;
      storeLogger.debug('Added part to message', { 
        messageId, 
        partId: part.partId, 
        totalParts: updatedParts.length 
      });

      return updated;
    });
  }, []);

  const finalizeMessage = useCallback((messageId, data) => {
    if (!messageId) {
      storeLogger.warn('finalizeMessage called without messageId');
      return;
    }

    setMessageStore(prev => {
      const existingEntry = prev[messageId] || {
        messageId,
        sessionId: data.sessionId || null,
        role: null,
        parts: [],
        finalized: false,
        finalizedMessage: null,
        projectName: null,
        mode: 'build',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        rawFinalizedData: null,
      };

      const updated = {
        ...prev,
        [messageId]: {
          ...existingEntry,
          role: data.role || existingEntry.role,
          finalized: true,
          finalizedMessage: data.message || existingEntry.finalizedMessage,
          projectName: data.projectName || existingEntry.projectName,
          mode: data.mode || existingEntry.mode,
          sessionId: data.sessionId || existingEntry.sessionId,
          updatedAt: Date.now(),
          rawFinalizedData: data.rawData || null,
        },
      };

      storeRef.current = updated;
      storeLogger.debug('Finalized message', { 
        messageId, 
        role: data.role,
        hasMessage: !!data.message,
      });

      return updated;
    });
  }, []);

  const getMessage = useCallback((messageId) => {
    return storeRef.current[messageId] || null;
  }, []);

  const getMessagesBySession = useCallback((sessionId) => {
    if (!sessionId) return [];
    return Object.values(storeRef.current).filter(entry => entry.sessionId === sessionId);
  }, []);

  const getMessagesByRole = useCallback((role) => {
    if (!role) return [];
    return Object.values(storeRef.current).filter(entry => entry.role === role);
  }, []);

  const getFinalizedMessages = useCallback(() => {
    return Object.values(storeRef.current).filter(entry => entry.finalized);
  }, []);

  const clearStore = useCallback(() => {
    storeLogger.debug('Clearing message store');
    setMessageStore({});
    storeRef.current = {};
  }, []);

  const removeMessage = useCallback((messageId) => {
    if (!messageId) return;

    setMessageStore(prev => {
      const { [messageId]: removed, ...rest } = prev;
      storeRef.current = rest;
      storeLogger.debug('Removed message from store', { messageId });
      return rest;
    });
  }, []);

  const assembleMessageText = useCallback((messageId) => {
    const entry = storeRef.current[messageId];
    if (!entry || entry.parts.length === 0) {
      return null;
    }

    const textParts = entry.parts
      .filter(p => p.partType === 'text' && p.text)
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    if (textParts.length > 0) {
      return textParts.map(p => p.text).join('');
    }

    const reasoningParts = entry.parts
      .filter(p => p.partType === 'reasoning' && p.text)
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    if (reasoningParts.length > 0) {
      return reasoningParts.map(p => p.text).join('');
    }

    return null;
  }, []);

  return {
    messageStore,
    getOrCreateMessage,
    addPart,
    finalizeMessage,
    getMessage,
    getMessagesBySession,
    getMessagesByRole,
    getFinalizedMessages,
    clearStore,
    removeMessage,
    assembleMessageText,
  };
};
