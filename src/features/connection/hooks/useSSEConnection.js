// Enhanced SSE connection management with state machine
import { useState, useCallback, useEffect, useRef } from 'react';
import { sseService } from '../services/sseService';
import { ConnectionStateEnum, ConnectionErrorTypeEnum } from '../types/connection.types';
import { logger } from '@/shared/services/logger';

const sseLogger = logger.tag('SSE');

/**
 * Enhanced SSE connection hook with proper state machine and callbacks
 * @param {string} baseUrl - Base URL for SSE endpoint
 * @param {Object} options - Connection options
 * @param {Function} options.heartbeatCallback - Callback to run on heartbeat
 * @param {Function} options.onStateChange - Callback when connection state changes
 * @param {Function} options.onError - Callback when error occurs
 * @param {Function} options.onHeartbeatMissed - Callback when heartbeat is missed
 * @param {Object} options.reconnectConfig - Reconnection configuration
 * @param {Object} options.heartbeatConfig - Heartbeat configuration
 * @returns {Object} Connection state and actions
 */
export const useSSEConnection = (baseUrl, options = {}) => {
  const {
    heartbeatCallback = null,
    onStateChange = null,
    onError = null,
    onHeartbeatMissed = null,
    reconnectConfig = {},
    heartbeatConfig = {},
  } = options;

  const [state, setState] = useState(ConnectionStateEnum.DISCONNECTED);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries, setMaxRetries] = useState(10);
  const eventSourceRef = useRef(null);

  // Track connection attempt to prevent doom loops
  const connectionAttemptRef = useRef(false);
  const lastBaseUrlRef = useRef(null);

  // Update service configuration and set callbacks
  useEffect(() => {
    sseService.configureReconnect({
      maxRetries: 10,
      initialDelayMs: 1000,
      maxDelayMs: 60000,
      backoffMultiplier: 2,
      jitterFactor: 0.3,
      silentMode: true,
      ...reconnectConfig,
    });

    // Heartbeat every 30 seconds to keep tunnel alive
    // Allow 30 minutes for acknowledgment to support long-running connections
    sseService.configureHeartbeat({
      enabled: true,
      intervalMs: 30000,
      timeoutMs: 1800000, // 30 minutes for long-running SSE connections
      ...heartbeatConfig,
    });

    sseService.setCallbacks({
      onStateChange: (newState, oldState) => {
        setState(newState);
        sseLogger.debug('Connection state changed in hook', { oldState, newState });
        if (onStateChange) {
          try {
            onStateChange(newState, oldState);
          } catch (err) {
            sseLogger.error('State change callback error', err);
          }
        }
      },
      onError: errorInfo => {
        const errorMessage = errorInfo?.message || 'Connection failed';
        setError(errorMessage);
        setErrorType(errorInfo?.type || ConnectionErrorTypeEnum.UNKNOWN);
        setRetryCount(errorInfo?.retryCount || 0);
        setMaxRetries(errorInfo?.maxRetries || 10);
        sseLogger.error('Connection error in hook', errorInfo);
        if (onError) {
          try {
            onError(errorInfo);
          } catch (err) {
            sseLogger.error('Error callback error', err);
          }
        }
      },
      onHeartbeatMissed: () => {
        sseLogger.warn('Heartbeat missed in hook');
        if (onHeartbeatMissed) {
          try {
            onHeartbeatMissed();
          } catch (err) {
            sseLogger.error('Heartbeat missed callback error', err);
          }
        }
      },
    });
  }, [onStateChange, onError, onHeartbeatMissed, reconnectConfig, heartbeatConfig]);

  const connect = useCallback(async () => {
    if (!baseUrl) {
      sseLogger.warn('Cannot connect: no baseUrl provided');
      return;
    }

    // Prevent doom loop: skip if already attempting to connect
    if (connectionAttemptRef.current) {
      sseLogger.debug('Skipping connect - connection attempt already in progress');
      return;
    }

    const sseUrl = `${baseUrl}/global/event`;
    sseLogger.debug('Connecting to SSE', { url: sseUrl });

    // Mark connection attempt
    connectionAttemptRef.current = true;

    try {
      // SSE service connect is now async with health check
      eventSourceRef.current = sseService.connect(sseUrl, { heartbeatCallback });
    } finally {
      // Always clear the attempt flag, even on failure
      connectionAttemptRef.current = false;
    }
  }, [baseUrl, heartbeatCallback]);

  const disconnect = useCallback(() => {
    sseLogger.debug('Disconnect requested');
    sseService.disconnect();
    setError(null);
    setErrorType(null);
    setRetryCount(0);
    eventSourceRef.current = null;
    connectionAttemptRef.current = false; // Reset connection attempt flag
  }, []);

  const reconnect = useCallback(() => {
    sseLogger.debug('Reconnect requested');
    sseService.reconnect();
  }, []);

  const clearError = useCallback(() => {
    sseLogger.debug('Clear error requested');
    sseService.clearError();
    setError(null);
    setErrorType(null);
    setRetryCount(0);
  }, []);

  const acknowledgeHeartbeat = useCallback(() => {
    sseService.acknowledgeHeartbeat();
  }, []);

  // Auto-connect when baseUrl changes and not already connected
  useEffect(() => {
    // Skip if baseUrl hasn't actually changed
    if (baseUrl === lastBaseUrlRef.current) {
      return;
    }

    const currentState = sseService.getState();
    const isConnectingOrConnected =
      currentState === ConnectionStateEnum.CONNECTING ||
      currentState === ConnectionStateEnum.CONNECTED ||
      currentState === ConnectionStateEnum.RECONNECTING;

    sseLogger.debug('Auto-connect effect', {
      baseUrl,
      currentState,
      isConnectingOrConnected,
      hasEventSource: !!eventSourceRef.current,
      hasConnectionAttempt: connectionAttemptRef.current,
    });

    if (
      baseUrl &&
      !isConnectingOrConnected &&
      !eventSourceRef.current &&
      !connectionAttemptRef.current
    ) {
      sseLogger.debug('Auto-connecting on baseUrl change', {
        baseUrl,
        previousUrl: lastBaseUrlRef.current,
      });
      lastBaseUrlRef.current = baseUrl;
      connect();
    }

    // Don't disconnect on cleanup - let the orchestrator control lifecycle
    // return () => disconnect();
  }, [baseUrl, connect, disconnect]);

  return {
    // Connection state
    state,
    isConnected: state === ConnectionStateEnum.CONNECTED,
    isConnecting: state === ConnectionStateEnum.CONNECTING,
    isReconnecting: state === ConnectionStateEnum.RECONNECTING,
    isFailed: state === ConnectionStateEnum.FAILED,
    isDisconnected: state === ConnectionStateEnum.DISCONNECTED,

    // Error info
    error,
    errorType,
    retryCount,
    maxRetries,

    // Actions
    connect,
    disconnect,
    reconnect,
    clearError,
    acknowledgeHeartbeat,
  };
};
