// Pure SSE connection management
import { useState, useRef, useEffect } from 'react';
import { sseService } from '../services/sseService';
import { logger } from '@/shared/services/logger';

const sseLogger = logger.tag('SSE');

export const useSSEConnection = (baseUrl, heartbeatCallback = null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  const connect = async () => {
    if (!baseUrl) return;

    setIsConnecting(true);
    setError(null);

    try {
      const sseUrl = `${baseUrl}/global/event`;
      eventSourceRef.current = sseService.connect(sseUrl, { heartbeatCallback });
      setIsConnected(true);
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    sseService.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    eventSourceRef.current = null;
  };

  useEffect(() => {
    if (baseUrl && !isConnected && !isConnecting) {
      sseLogger.debug('Auto-connecting on baseUrl change', { baseUrl });
      connect();
    }
    return () => disconnect();
  }, [baseUrl]);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect
  };
};