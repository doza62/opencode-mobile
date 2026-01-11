// App lifecycle and notification management with reconnection support
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { logger } from '@/shared/services/logger';

const appLogger = logger.tag('AppState');

export const useAppState = (options = {}) => {
  const { onForeground = null, onBackground = null } = options;
  const [appState, setAppState] = useState(AppState.currentState);
  const [previousAppState, setPreviousAppState] = useState(null);
  const lastForegroundTimeRef = useRef(null);

  const handleAppStateChange = useCallback(
    nextAppState => {
      const currentState = appState;
      const isComingToForeground =
        (currentState === 'inactive' || currentState === 'background') && nextAppState === 'active';
      const isGoingToBackground =
        currentState === 'active' && (nextAppState === 'inactive' || nextAppState === 'background');

      setPreviousAppState(currentState);
      setAppState(nextAppState);

      appLogger.debug('App state changed', {
        from: currentState,
        to: nextAppState,
        isComingToForeground,
        isGoingToBackground,
      });

      if (isGoingToBackground && onBackground) {
        try {
          onBackground();
        } catch (error) {
          appLogger.error('Background callback error', error);
        }
      }

      if (isComingToForeground && onForeground) {
        lastForegroundTimeRef.current = Date.now();
        try {
          onForeground();
        } catch (error) {
          appLogger.error('Foreground callback error', error);
        }
      }
    },
    [appState, onForeground, onBackground],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => subscription?.remove();
  }, [handleAppStateChange]);

  return {
    appState,
    previousAppState,
    isActive: appState === 'active',
    isBackground: appState === 'background',
    isInactive: appState === 'inactive',
    isTransitioning: appState === 'transitioning',
    lastForegroundTime: lastForegroundTimeRef.current,
  };
};

export default useAppState;
