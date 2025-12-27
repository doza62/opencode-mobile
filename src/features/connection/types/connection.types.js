/**
 * @typedef {Object} ConnectionState
 * @property {boolean} isConnected - Whether SSE is connected
 * @property {boolean} isConnecting - Whether connection is in progress
 * @property {boolean|null} isServerReachable - Server reachability status
 * @property {string|null} error - Connection error message
 */

/**
 * @typedef {Object} ConnectionActions
 * @property {Function} connect - Establish connection
 * @property {Function} disconnect - Close connection
 * @property {Function} testConnectivity - Test server reachability
 * @property {Function} validateAndConnect - Validate URL and connect
 */

/**
 * @typedef {Object} AppStateInfo
 * @property {string} appState - Current app state ('active', 'background', 'inactive')
 * @property {boolean} isActive - Whether app is active
 * @property {boolean} isBackground - Whether app is in background
 * @property {boolean} isInactive - Whether app is inactive
 */

// Export empty object to make this a valid module
export {};