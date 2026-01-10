import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { lightTheme, darkTheme } from '@/shared/constants/themes';
import { storage } from '@/shared/services/storage';
import { STORAGE_KEYS } from '@/shared/constants/storage';
import { logger } from '@/shared/services/logger';

const themeLogger = logger.tag('Theme');

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const preferences = await storage.get(STORAGE_KEYS.USER_PREFERENCES);
        if (preferences && preferences.theme) {
          setTheme(preferences.theme === 'dark' ? darkTheme : lightTheme);
          return;
        }
      } catch (error) {
        themeLogger.error('Failed to load theme preference', error);
      }

      const initialScheme = Appearance.getColorScheme();
      setTheme(initialScheme === 'dark' ? darkTheme : lightTheme);

      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
      });

      return () => subscription?.remove();
    };

    loadThemePreference();
  }, []);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};