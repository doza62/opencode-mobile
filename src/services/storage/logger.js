import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Logging disabled for now

class Logger {
  constructor() {
    // Disable file logging for now
    this.isFileSystemAvailable = false;
  }

  async initializeLog() {
    // Logging disabled
  }

  async writeLog(level, message, data = null) {
    // Logging disabled - do nothing
  }

  async rotateLog() {
    // Logging disabled
  }

  async getLogs(lines = 100) {
    return 'Logging disabled.';
  }

  async clearLogs() {
    // Logging disabled
  }

  // Convenience methods - console fallback for mobile
  async info(message, data) {
    console.log(`[INFO] ${message}`, data);
  }
  async warn(message, data) {
    console.warn(`[WARN] ${message}`, data);
  }
  async error(message, data) {
    console.error(`[ERROR] ${message}`, data);
  }
  async debug(message, data) {
    console.log(`[DEBUG] ${message}`, data);
  }

  // Log app events - console fallback
  async logAppStart() {
    console.log('[APP] App started');
  }
  async logScreenView(screenName, params = {}) {
    console.log(`[SCREEN] Viewing ${screenName}`, params);
  }
  async logUserAction(action, details = {}) {
    console.log(`[ACTION] ${action}`, details);
  }
  async logNetworkRequest(url, method, status, duration) {
    console.log(`[NETWORK] ${method} ${url} - ${status} (${duration}ms)`);
  }
  async logError(error, context = {}) {
    console.error('[ERROR]', error, context);
  }
}

export default new Logger();