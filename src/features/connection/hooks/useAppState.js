// App lifecycle and notification management
import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import { logger } from '@/shared/services/logger';

const appLogger = logger.tag('AppState');

export const useAppState = (selectedSession) => {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);

      if (nextAppState === 'inactive' && selectedSession) {
        appLogger.debug('App going inactive with active session');
      }
    });

    return () => subscription?.remove();
  }, [selectedSession]);

  return {
    appState,
    isActive: appState === 'active',
    isBackground: appState === 'background',
    isInactive: appState === 'inactive'
  };
};