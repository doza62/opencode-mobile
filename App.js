import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

 import ChatScreen from './src/ChatScreen';
import { useSSEOrchestrator as useSSE } from './src/features/connection/hooks/useSSEOrchestrator';
import { ThemeProvider, useTheme } from './src/shared/components/ThemeProvider';
import { DEBUG } from './src/shared/constants';

// Override console.debug based on DEBUG flag
if (!DEBUG) {
  console.debug = () => {};
}

// App start - entry point
console.debug('\n\n===== APP STARTED =====\n\n');

// const Stack = createNativeStackNavigator();

function AppContent() {
  const sseData = useSSE();
  const theme = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SafeAreaProvider>
        <ChatScreen {...sseData} />
      </SafeAreaProvider>
      <StatusBar style={theme.colors.statusBarStyle} backgroundColor={theme.colors.background} />
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}


