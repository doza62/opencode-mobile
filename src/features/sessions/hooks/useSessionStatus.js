import { useState, useCallback } from 'react';
import { getSessionMessages } from '@/features/sessions/services/sessionService';
import { normalizeLoadedMessages } from '@/features/messaging/utils/messageNormalizer';
import { generateMessageId } from '@/features/messaging/utils/messageIdGenerator';
import { logger } from '@/shared/services/logger';

const sessionLogger = logger.tag('Session');

/**
 * Custom hook for managing session status and thinking animation
 * @param {Object} selectedSession - Currently selected session
 * @param {string} baseUrl - Base URL for API calls
 * @param {Object} selectedProject - Currently selected project
 * @param {Object} messaging - Message processing instance with loadMessages and addEvent
 * @returns {Object} - Session status state and handlers
 */
export const useSessionStatus = (selectedSession, baseUrl = null, selectedProject = null, messaging = null) => {
  const [isThinking, setIsThinking] = useState(false);

  const onIdle = useCallback(async () => {
    sessionLogger.debug('onIdle triggered');

    if (!baseUrl || !selectedSession?.id || !messaging) {
      sessionLogger.warn('Missing required params for onIdle');
      return;
    }

    try {
      const messages = await getSessionMessages(selectedSession.id, baseUrl, selectedProject, 5);
      sessionLogger.debug('API returned messages', { count: messages?.length });

      if (!messages || messages.length === 0) {
        sessionLogger.debug('No messages from API');
        return;
      }

      const normalizedMessages = normalizeLoadedMessages(messages);
      sessionLogger.debug('Normalized messages', { count: normalizedMessages?.length });

      const agentMessages = normalizedMessages
        .filter(msg => msg.payload?.properties?.info?.role === 'assistant')
        .sort((a, b) => {
          const aTime = a.payload?.properties?.info?.created_at || a.payload?.properties?.info?.timestamp || 0;
          const bTime = b.payload?.properties?.info?.created_at || b.payload?.properties?.info?.timestamp || 0;
          return bTime - aTime;
        });

      if (agentMessages.length === 0) {
        sessionLogger.debug('No agent messages found in session');
        return;
      }

      const latestAgentMessage = agentMessages[0];
      const messageId = latestAgentMessage.payload?.properties?.info?.id;
      const messageBody = latestAgentMessage.payload?.properties?.info?.summary?.body;

      sessionLogger.debug('Latest agent message', { messageId, hasBody: !!messageBody });

      if (messageBody) {
        messaging.addEvent({
          id: generateMessageId(),
          type: 'message_finalized',
          category: 'message',
          message: messageBody,
          messageId: messageId,
          sessionId: selectedSession.id,
          mode: latestAgentMessage.payload?.properties?.info?.agent || 'build',
          rawData: latestAgentMessage
        });
        sessionLogger.debug('Added finalized message to UI');
        return;
      }

      // Try to assemble from accumulated partial messages
      if (messaging.assemblePartialMessages && typeof messaging.assemblePartialMessages === 'function') {
        const assembledText = messaging.assemblePartialMessages(messageId);
        if (assembledText) {
          messaging.addEvent({
            id: generateMessageId(),
            type: 'message_finalized',
            category: 'message',
            message: assembledText,
            messageId: messageId,
            sessionId: selectedSession.id,
            mode: latestAgentMessage.payload?.properties?.info?.agent || 'build',
            rawData: latestAgentMessage
          });
          sessionLogger.debug('Added assembled message from partials to UI');
          return;
        }
      }

      // Fallback to parts in the message
      const parts = latestAgentMessage.payload?.properties?.info?.parts;
      if (Array.isArray(parts) && parts.length > 0) {
        // Try text parts first
        const textPart = parts.find(p => p.type === 'text' && p.text);
        if (textPart?.text) {
          messaging.addEvent({
            id: generateMessageId(),
            type: 'message_finalized',
            category: 'message',
            message: textPart.text,
            messageId: messageId,
            sessionId: selectedSession.id,
            mode: latestAgentMessage.payload?.properties?.info?.agent || 'build',
            rawData: latestAgentMessage
          });
          sessionLogger.debug('Added text part message to UI');
          return;
        }

        // Fallback to reasoning parts
        const reasoningPart = parts.find(p => p.type === 'reasoning' && p.text);
        if (reasoningPart?.text) {
          messaging.addEvent({
            id: generateMessageId(),
            type: 'message_finalized',
            category: 'message',
            message: reasoningPart.text,
            messageId: messageId,
            sessionId: selectedSession.id,
            mode: latestAgentMessage.payload?.properties?.info?.agent || 'build',
            rawData: latestAgentMessage
          });
          sessionLogger.debug('Added reasoning message to UI');
          return;
        }
      }

      messaging.addEvent({
        id: generateMessageId(),
        type: 'message_finalized',
        category: 'message',
        message: `Agent task finished: ${latestAgentMessage.payload?.properties?.info?.finish || 'complete'}`,
        messageId: messageId,
        sessionId: selectedSession.id,
        mode: latestAgentMessage.payload?.properties?.info?.agent || 'build',
        rawData: latestAgentMessage
      });
      sessionLogger.debug('Added completion message to UI');
    } catch (error) {
      sessionLogger.error('onIdle error', error);
    }
  }, [baseUrl, selectedSession, messaging]);

  const handleSessionStatus = useCallback((message) => {
    sessionLogger.debugCtx('SESSION_MANAGEMENT', 'Processing session status message', {
      payloadType: message.payload?.type,
      messageSessionId: message.payload?.properties?.sessionID,
      selectedSessionId: selectedSession?.id
    });

    if (message.payload?.type !== 'session.status' && message.payload?.type !== 'session.idle') {
      sessionLogger.debug('Not a session status/idle message, skipping');
      return false;
    }

    const statusType = message.payload?.type === 'session.idle' ? 'idle' : message.payload.properties.status?.type;
    const messageSessionId = message.payload.properties.sessionID;
    const selectedSessionId = selectedSession?.id;

    if (messageSessionId !== selectedSessionId) {
      sessionLogger.debug('Session ID mismatch, skipping status handling', {
        messageSession: messageSessionId,
        currentSession: selectedSessionId
      });
      return false;
    }

    if (statusType === 'busy') {
      sessionLogger.debug('Session is busy, showing thinking indicator');
      setIsThinking(true);
    } else if (statusType === 'idle') {
      sessionLogger.debug('Session is idle, hiding thinking indicator');
      setIsThinking(false);
      onIdle();
    }

    return true;
  }, [selectedSession?.id, onIdle]);

  const resetThinking = useCallback(() => {
    setIsThinking(false);
  }, []);

  return {
    isThinking,
    handleSessionStatus,
    resetThinking
  };
};