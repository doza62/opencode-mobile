import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DarkModeToggle from '@/components/common/DarkModeToggle';
import { logger } from '@/shared/services/logger';

const settingsLogger = logger.tag('NotificationSettings');

const NotificationSettings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotificationsEnabled(parsed.notificationsEnabled ?? true);
        setSoundEnabled(parsed.soundEnabled ?? true);
      }
    } catch (error) {
      settingsLogger.error('Failed to load notification settings', error);
    }
  };

  const saveSettings = async (settings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
    } catch (error) {
      settingsLogger.error('Failed to save notification settings', error);
    }
  };

  const toggleNotifications = (value) => {
    setNotificationsEnabled(value);
    saveSettings({ notificationsEnabled: value, soundEnabled });
  };

  const toggleSound = (value) => {
    setSoundEnabled(value);
    saveSettings({ notificationsEnabled, soundEnabled: value });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Settings</Text>

      <View style={styles.setting}>
        <Text style={styles.label}>Enable Notifications</Text>
        <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
      </View>

      <View style={styles.setting}>
        <Text style={styles.label}>Sound</Text>
        <Switch value={soundEnabled} onValueChange={toggleSound} />
      </View>

      <DarkModeToggle />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  setting: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  label: { fontSize: 16 }
});

export default NotificationSettings;