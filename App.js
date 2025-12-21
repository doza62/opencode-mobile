import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import EventScreen from './src/screens/EventScreen';
import notificationService from './src/utils/notificationService';

export default function App() {
  useEffect(() => {
    console.log('\n\n🚀 ===== APP STARTED =====\n\n');
    // Initialize notifications on app startup
    notificationService.initialize();

    // Handle notification taps
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { sessionId, messageId } = response.notification.request.content.data;
      console.log('Notification tapped for session:', sessionId, 'message:', messageId);
      // TODO: Navigate to specific session and highlight the message
      // This will be implemented when navigation system is added
    });

    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      <EventScreen />
      <StatusBar style="dark" backgroundColor="#ffffff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
