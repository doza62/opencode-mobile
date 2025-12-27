// App lifecycle and notification management
import { useState, useEffect } from 'react';
import { AppState } from 'react-native';

export const useAppState = (selectedSession) => {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);

      // Handle app state changes for notifications
      if (nextAppState === 'inactive' && selectedSession) {
        // Could trigger notifications here
        console.log('App going inactive with active session');
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