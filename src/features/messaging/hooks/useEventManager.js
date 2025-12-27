// Event management for SSE messages
import { useEffect } from 'react';
import { sseService } from '@/services/sse/sse.service';

export const useEventManager = (onMessage, selectedSession) => {
  useEffect(() => {
    if (!selectedSession) return;

    // Set up message handler
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const messages = Array.isArray(data) ? data : [data];

        messages.forEach(message => {
          // Only process messages for current session
          const sessionId = message.session_id || message.sessionId ||
                           message.payload?.properties?.sessionID;

          if (sessionId === selectedSession.id) {
            onMessage(message);
          }
        });
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
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