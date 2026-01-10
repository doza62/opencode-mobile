/**
 * Hook for managing resizable drawer behavior (simplified for iOS compatibility)
 * @param {number} initialHeightPercent - Initial height as percentage of screen
 * @returns {Object} Drawer state and gesture handlers
 */
import { useState, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { State } from 'react-native-gesture-handler';

export const useResizableDrawer = (initialHeightPercent = 0.6) => {
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const initialHeight = screenHeight * initialHeightPercent;

  const [drawerHeight, setDrawerHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);

  const isWideScreen = screenWidth >= 768;

  // Clone event data to avoid frozen object issues on iOS
  const onGestureEvent = useCallback((event) => {
    const { translationY } = { ...event.nativeEvent };
    const newHeight = Math.max(
      screenHeight * 0.3, // Minimum 30%
      Math.min(
        screenHeight * 0.9, // Maximum 90%
        drawerHeight - translationY
      )
    );
    setDrawerHeight(newHeight);
  }, [drawerHeight, screenHeight]);

  // Clone event data and use direct state updates (no animation)
  const onHandlerStateChange = useCallback((event) => {
    const eventData = { ...event.nativeEvent };

    if (eventData.state === State.END) {
      const { translationY, velocityY } = eventData;
      let finalHeight = drawerHeight - translationY;

      // Snap to common heights if close and velocity is low
      const snapThreshold = screenHeight * 0.05; // 5% threshold
      if (Math.abs(velocityY) < 500) {
        const heights = [0.4, 0.6, 0.8].map(h => screenHeight * h);
        for (const height of heights) {
          if (Math.abs(finalHeight - height) < snapThreshold) {
            finalHeight = height;
            break;
          }
        }
      }

      // Apply constraints
      finalHeight = Math.max(
        screenHeight * 0.3,
        Math.min(screenHeight * 0.9, finalHeight)
      );

      setDrawerHeight(finalHeight);
      setIsResizing(false);
    } else if (eventData.state === State.BEGAN) {
      setIsResizing(true);
    }
  }, [drawerHeight, screenHeight]);

  const resetHeight = useCallback(() => {
    setDrawerHeight(screenHeight * initialHeightPercent);
  }, [screenHeight, initialHeightPercent]);

  return {
    drawerHeight, // Now just a number, no Animated.Value
    isResizing,
    isWideScreen,
    screenHeight,
    screenWidth,
    onGestureEvent,
    onHandlerStateChange,
    resetHeight
  };
};