import * as Notifications from 'expo-notifications';
import { storage } from '@/shared/services/storage';
import { STORAGE_KEYS } from '@/shared/constants/storage';
import { logger } from '@/shared/services/logger';

const deepLinkLogger = logger.tag('DeepLink');

const DEEP_LINK_EXPIRY_MS = 5 * 60 * 1000;

class DeepLinkService {
  constructor() {
    this.responseListener = null;
    this.onDeepLinkCallback = null;
  }

  /**
   * @param {Function} onDeepLink - Callback: (data) => void
   */
  initialize(onDeepLink) {
    this.onDeepLinkCallback = onDeepLink;

    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      this.handleNotificationResponse(response);
    });

    this.checkInitialNotification();
  }

  async checkInitialNotification() {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (response?.notification) {
      deepLinkLogger.debug('App opened from notification');
      this.handleNotificationResponse(response);
    }
  }

  handleNotificationResponse(response) {
    const data = response.notification?.request?.content?.data;
    if (!data) return;

    deepLinkLogger.debug('Notification tapped', { type: data.type });

    const deepLinkData = {
      type: data.type,
      serverUrl: data.serverUrl,
      projectPath: data.projectPath,
      sessionId: data.sessionId,
      messageId: data.messageId,
      permissionId: data.permissionId,
      timestamp: Date.now(),
    };

    if (this.onDeepLinkCallback) {
      this.onDeepLinkCallback(deepLinkData);
    } else {
      storage.set(STORAGE_KEYS.PENDING_DEEP_LINK, deepLinkData);
    }
  }

  async checkPendingDeepLink() {
    const pending = await storage.get(STORAGE_KEYS.PENDING_DEEP_LINK);
    if (pending && this.onDeepLinkCallback) {
      if (Date.now() - pending.timestamp < DEEP_LINK_EXPIRY_MS) {
        this.onDeepLinkCallback(pending);
      }
      await storage.remove(STORAGE_KEYS.PENDING_DEEP_LINK);
    }
  }

  cleanup() {
    this.responseListener?.remove();
    this.responseListener = null;
  }
}

export default new DeepLinkService();
