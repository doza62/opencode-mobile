import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreenNative from 'expo-splash-screen';
import * as Font from 'expo-font';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_700Bold,
} from '@expo-google-fonts/ibm-plex-mono';

import ChatScreen from './src/ChatScreen';
import { useSSEOrchestrator } from './src/features/connection/hooks/useSSEOrchestrator';
import { ThemeProvider, useTheme } from './src/shared/components/ThemeProvider';
import { SplashScreen, AppErrorBoundary } from './src/components/common';
import { DEBUG } from './src/shared/constants';
import { logger } from '@/shared/services/logger';

// Force DEBUG logging
logger.setLevel('DEBUG');

if (!DEBUG) {
  console.debug = () => {};
}

console.debug('\n\n===== APP STARTED =====\n\n');

SplashScreenNative.preventAutoHideAsync();

function AppContent({ fontsLoaded, onLayoutRootView }) {
  const sseData = useSSEOrchestrator();
  const theme = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      const timer = setTimeout(() => {
        setAppReady(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView 
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      onLayout={onLayoutRootView}
    >
      <SafeAreaProvider>
        <ChatScreen {...sseData} />
      </SafeAreaProvider>
      <StatusBar style={theme.colors.statusBarStyle} backgroundColor={theme.colors.background} />
      {showSplash && (
        <SplashScreen 
          isReady={appReady} 
          onAnimationComplete={handleSplashComplete} 
        />
      )}
    </GestureHandlerRootView>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'IBMPlexMono-Regular': IBMPlexMono_400Regular,
          'IBMPlexMono-Medium': IBMPlexMono_500Medium,
          'IBMPlexMono-Bold': IBMPlexMono_700Bold,
        });
        setFontsLoaded(true);
      } catch (e) {
        console.error('Error loading fonts:', e);
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreenNative.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <ThemeProvider>
      <AppErrorBoundary>
        <AppContent fontsLoaded={fontsLoaded} onLayoutRootView={onLayoutRootView} />
      </AppErrorBoundary>
    </ThemeProvider>
  );
}
