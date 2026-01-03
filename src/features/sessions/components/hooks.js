// hooks.js - Custom hooks for session drawer
import { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Gesture constants
const EDGE_ZONE_WIDTH = 20; // px from left edge
const GESTURE_THRESHOLD = screenWidth * 0.25; // 25% of screen width
const VELOCITY_THRESHOLD = 400; // points per second

export const useDrawerAnimation = (isPersistent, onClose) => {
  console.debug('useDrawerAnimation called:', { isPersistent, screenWidth });
  const initialTranslateX = isPersistent ? 0 : -screenWidth * 0.8;
  console.debug('Initial translateX:', initialTranslateX);

  const translateX = useSharedValue(initialTranslateX);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const openDrawer = () => {
    console.debug('openDrawer called, setting translateX to 0');
    translateX.value = withTiming(0, { duration: 300 });
  };

  const closeDrawer = () => {
    const closePosition = -screenWidth * 0.8;
    console.debug('closeDrawer called, setting translateX to', closePosition);
    translateX.value = withTiming(closePosition, { duration: 300 }, (finished) => {
      if (finished && onClose) {
        runOnJS(onClose)();
      }
    });
  };

  const gestureHandler = Gesture.Pan()
    .activeOffsetX([-EDGE_ZONE_WIDTH, EDGE_ZONE_WIDTH])
    .onUpdate((event) => {
      if (!isPersistent) {
        // Only respond to horizontal gestures
        if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
          const clampedX = Math.max(-screenWidth * 0.8, Math.min(0, event.translationX));
          translateX.value = clampedX;
        }
      }
    })
    .onEnd((event) => {
      if (!isPersistent && Math.abs(event.translationX) > Math.abs(event.translationY)) {
        const { translationX, velocityX } = event;
        const shouldOpen = translationX > GESTURE_THRESHOLD || velocityX > VELOCITY_THRESHOLD;
        const shouldClose = translationX < -GESTURE_THRESHOLD || velocityX < -VELOCITY_THRESHOLD;

        if (shouldOpen && translateX.value < 0) {
          openDrawer();
        } else if (shouldClose && translateX.value > -screenWidth * 0.8) {
          closeDrawer();
        } else {
          // Snap to nearest state
          const snapToOpen = Math.abs(translationX) < GESTURE_THRESHOLD;
          translateX.value = withTiming(
            snapToOpen ? 0 : -screenWidth * 0.8,
            { duration: 200 }
          );
        }
      }
    });

  return {
    translateX,
    animatedStyle,
    gestureHandler,
    openDrawer,
    closeDrawer,
  };
};

export const useSessionExpansion = () => {
  // This will manage expanded/collapsed state for session groups
  // For now, return a simple implementation
  return {
    expandedParents: new Set(),
    toggleExpanded: (parentId) => {
      // Implementation will be added when SessionItem is created
    },
  };
};