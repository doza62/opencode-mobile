// SSE (Server-Sent Events) service wrapper
import EventSource from 'react-native-sse';
import { logger } from '@/shared/services/logger';

const sseLogger = logger.tag('SSE');

/**
 * SSE service for real-time connections
 */
export class SSEService {
  constructor() {
    this.eventSource = null;
    this.isConnected = false;
    this.reconnectTimeout = null;
    this.heartbeatInterval = null;
    this.heartbeatCallback = null;
  }

  /**
   * Connect to SSE endpoint
   * @param {string} url - SSE endpoint URL
   * @param {Object} options - Connection options
   * @param {Function} options.heartbeatCallback - Callback to run on heartbeat
   * @returns {EventSource} - EventSource instance
   */
  connect(url, options = {}) {
    this.disconnect();

    sseLogger.debug('Connecting to SSE endpoint', { url });

    this.heartbeatCallback = options.heartbeatCallback || null;

    this.eventSource = new EventSource(url, {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        ...options.headers
      }
    });

    this.eventSource.addEventListener('open', () => {
      sseLogger.debug('SSE connection opened');
      this.isConnected = true;
      this.startHeartbeat();
    });

    this.eventSource.addEventListener('error', (event) => {
      sseLogger.error('SSE connection error', event);
      this.isConnected = false;
      this.scheduleReconnect(url, options);
    });

    return this.eventSource;
  }

  /**
   * Disconnect from SSE
   */
  disconnect() {
    if (this.eventSource) {
      sseLogger.debug('Disconnecting from SSE');
      this.eventSource.close();
      this.eventSource = null;
    }

    this.isConnected = false;
    this.stopHeartbeat();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event type
   * @param {Function} callback - Event callback
   */
  addEventListener(event, callback) {
    if (this.eventSource) {
      this.eventSource.addEventListener(event, callback);
    }
  }

  /**
   * Remove event listener
   * @param {string} event - Event type
   * @param {Function} callback - Event callback
   */
  removeEventListener(event, callback) {
    if (this.eventSource) {
      this.eventSource.removeEventListener(event, callback);
    }
  }

  /**
   * Start heartbeat monitoring
   */
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.eventSource && this.eventSource.readyState !== EventSource.OPEN) {
        sseLogger.warn('SSE heartbeat failed, reconnecting...');
        this.isConnected = false;
      } else {
        if (this.heartbeatCallback) {
          try {
            this.heartbeatCallback();
          } catch (error) {
            sseLogger.error('SSE heartbeat callback error', error);
          }
        }
      }
    }, 30000);
  }

  /**
   * Stop heartbeat monitoring
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Schedule reconnection
   * @param {string} url - SSE URL
   * @param {Object} options - Connection options
   */
  scheduleReconnect(url, options) {
    if (this.reconnectTimeout) return;

    sseLogger.debug('Scheduling reconnect in 5 seconds');
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect(url, options);
    }, 5000);
  }

  /**
   * Get connection status
   * @returns {boolean} - Connection status
   */
  getStatus() {
    return this.isConnected;
  }

  /**
   * Get ready state
   * @returns {number} - Ready state
   */
  getReadyState() {
    return this.eventSource ? this.eventSource.readyState : EventSource.CLOSED;
  }
}

// Export singleton instance
export const sseService = new SSEService();