// Event management for SSE messages
import { useEffect } from 'react';
import { sseService } from '@/features/connection/services/sseService';
import { logger } from '@/shared/services/logger';

const sseLogger = logger.tag('SSE');
const sessionFilterLogger = logger.rateLimit('SessionFilter', 1);

export const useEventManager = (onMessage, selectedSession) => {
  useEffect(() => {
    if (!selectedSession) return;

    // Set up message handler
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const messages = Array.isArray(data) ? data : [data];

        messages.forEach(message => {
          const payloadType = message.payload?.type;

          sseLogger.debug('Processing message', {
            type: payloadType,
            sessionId: message.payload?.properties?.sessionID
          });

          // Allow message.updated events to bypass session filtering
          if (payloadType === 'message.updated') {
            onMessage(message);
            return;
          }

          // Only process messages for current session
          const sessionId = message.session_id || message.sessionId ||
                            message.info?.sessionID || // For incoming SSE messages
                            message.payload?.properties?.sessionID ||
                            message.payload?.properties?.info?.sessionID ||
                            message.payload?.properties?.part?.sessionID;

          if (sessionId === selectedSession.id) {
            sseLogger.debug('Dispatching message to handler', { type: payloadType });
            onMessage(message);
          } else {
            sessionFilterLogger.debug('Skipping message for different session', {
              messageType: payloadType,
              messageSession: sessionId,
              currentSession: selectedSession.id
            });
          }
        });
      } catch (error) {
        sseLogger.error('Failed to parse SSE message', error);
      }
    };

    // Add event listener
    sseService.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      sseService.removeEventListener('message', handleMessage);
    };
  }, [onMessage, selectedSession]);

  return {
    isConnected: sseService.getStatus(),
    readyState: sseService.getReadyState()
  };
};