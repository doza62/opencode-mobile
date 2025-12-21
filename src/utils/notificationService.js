import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Notification service for opencode mobile app
 */
class NotificationService {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialize notification service
   */
  async initialize() {
    if (!Device.isDevice) {
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    this.isInitialized = true;
  }

  /**
   * Schedule a local notification for new message
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Object} data - Additional data
   */
  async scheduleNotification(title, body, data = {}) {
    if (!this.isInitialized) {
      return;
    }

    // Check user preferences
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        if (!parsed.notificationsEnabled) {
          return;
        }
      }
    } catch (error) {
      console.error('Failed to check notification settings:', error);
    }

    console.log('Scheduling notification:', { title, body, data });
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null, // Show immediately
    });
  }

  /**
   * Set current session for filtering notifications
   * @param {Function} getter - Function to get current session
   */
  setCurrentSessionGetter(getter) {
    this.getCurrentSession = getter;
  }

  /**
   * Check if app is in foreground
   * @returns {boolean} - True if app is active
   */
  isAppActive() {
    return require('react-native').AppState.currentState === 'active';
  }
}

export default new NotificationService();