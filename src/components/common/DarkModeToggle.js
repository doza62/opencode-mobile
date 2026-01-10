import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/components/ThemeProvider';
import { storage } from '@/shared/services/storage';
import { STORAGE_KEYS } from '@/shared/constants/storage';
import { logger } from '@/shared/services/logger';

const themeLogger = logger.tag('Theme');

const DarkModeToggle = () => {
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme.isDark);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const preferences = await storage.get(STORAGE_KEYS.USER_PREFERENCES);
      if (preferences && preferences.theme) {
        setIsDarkMode(preferences.theme === 'dark');
      } else {
        setIsDarkMode(theme.isDark);
      }
    } catch (error) {
      themeLogger.error('Failed to load theme preference', error);
    }
  };

  const toggleTheme = async (value) => {
    try {
      setIsDarkMode(value);
      const preferences = await storage.get(STORAGE_KEYS.USER_PREFERENCES) || {};
      preferences.theme = value ? 'dark' : 'light';
      await storage.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
    } catch (error) {
      themeLogger.error('Failed to save theme preference', error);
    }
  };

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Dark Mode</Text>
      <Switch
        value={isDarkMode}
        onValueChange={toggleTheme}
        trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
        thumbColor={isDarkMode ? theme.colors.surface : theme.colors.surfaceSecondary}
        ios_backgroundColor={theme.colors.border}
      />
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginVertical: 4,
  },
  label: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
});

export default DarkModeToggle;