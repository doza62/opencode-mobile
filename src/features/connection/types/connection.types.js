/**
 * Connection state values
 * @enum {string}
 */
export const ConnectionStateEnum = {
  /** Initial disconnected state */
  DISCONNECTED: 'disconnected',
  /** Actively establishing connection */
  CONNECTING: 'connecting',
  /** Successfully connected and receiving events */
  CONNECTED: 'connected',
  /** Connection lost, attempting to reconnect */
  RECONNECTING: 'reconnecting',
  /** All reconnection attempts exhausted */
  FAILED: 'failed',
};

/**
 * Error types for connection failures
 * @enum {string}
 */
export const ConnectionErrorTypeEnum = {
  /** Network is unreachable */
  NETWORK_UNREACHABLE: 'network_unreachable',
  /** Connection timed out */
  TIMEOUT: 'timeout',
  /** Server returned error */
  SERVER_ERROR: 'server_error',
  /** Authentication failed */
  AUTH_ERROR: 'auth_error',
  /** Invalid URL or configuration */
  CONFIG_ERROR: 'config_error',
  /** Unknown error */
  UNKNOWN: 'unknown',
};

/**
 * Reconnection configuration
 * @typedef {Object} ReconnectConfig
 * @property {number} maxRetries - Maximum reconnection attempts (default: 10)
 * @property {number} initialDelayMs - Initial delay before first reconnect (default: 1000)
 * @property {number} maxDelayMs - Maximum delay between retries (default: 60000)
 * @property {number} backoffMultiplier - Delay multiplier for exponential backoff (default: 2)
 * @property {number} jitterFactor - Random jitter factor (0-1) to avoid thundering herd (default: 0.3)
 * @property {boolean} silentMode - Don't expose errors until max retries exhausted (default: true)
 */

/**
 * Heartbeat configuration
 * @typedef {Object} HeartbeatConfig
 * @property {number} intervalMs - Heartbeat interval (default: 30000)
 * @property {number} timeoutMs - Expected time to receive acknowledgment (default: 10000)
 * @property {boolean} enabled - Whether heartbeat is enabled (default: true)
 */

/**
 * SSE Connection configuration
 * @typedef {Object} SSEConnectionConfig
 * @property {ReconnectConfig} reconnect - Reconnection behavior
 * @property {HeartbeatConfig} heartbeat - Heartbeat monitoring
 * @property {Function} onStateChange - Callback when connection state changes
 * @property {Function} onError - Callback when error occurs (only after max retries if silentMode)
 * @property {Function} onHeartbeatMissed - Callback when heartbeat is missed
 */

/**
 * @typedef {Object} ConnectionStateInfo
 * @property {string} state - Current connection state (ConnectionStateEnum values)
 * @property {boolean} isConnected - Whether SSE is connected
 * @property {boolean} isConnecting - Whether connection is in progress
 * @property {boolean} isReconnecting - Whether attempting to reconnect
 * @property {boolean} isFailed - Whether all reconnection attempts exhausted
 * @property {boolean|null} isServerReachable - Server reachability status
 * @property {string|null} error - Connection error message
 * @property {string|null} errorType - Connection error type (ConnectionErrorTypeEnum values)
 * @property {number} retryCount - Current retry attempt number
 * @property {number} maxRetries - Maximum retry attempts configured
 */

/**
 * @typedef {Object} ConnectionActions
 * @property {Function} connect - Establish connection
 * @property {Function} disconnect - Close connection
 * @property {Function} reconnect - Force immediate reconnection
 * @property {Function} testConnectivity - Test server reachability
 * @property {Function} validateAndConnect - Validate URL and connect
 * @property {Function} clearError - Clear connection error
 */

// Export empty object to make this a valid module
export {};
