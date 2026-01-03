// hooks.js - Custom hooks for session drawer
import { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';

// Gesture constants - fixed values for reliability
const EDGE_ZONE_WIDTH = 20; // px from left edge
const GESTURE_THRESHOLD = 80; // Fixed threshold based on 320px drawer
const VELOCITY_THRESHOLD = 400; // points per second
const DRAWER_WIDTH = 320; // Fixed drawer width

export const useDrawerAnimation = (isPersistent, onClose) => {
  console.debug('useDrawerAnimation called:', { isPersistent });
  const initialTranslateX = isPersistent ? 0 : -DRAWER_WIDTH;
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
    const closePosition = -DRAWER_WIDTH;
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
          const clampedX = Math.max(-DRAWER_WIDTH, Math.min(0, event.translationX));
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
        } else if (shouldClose && translateX.value > -DRAWER_WIDTH) {
          closeDrawer();
        } else {
          // Snap to nearest state
          const snapToOpen = Math.abs(translationX) < GESTURE_THRESHOLD;
          translateX.value = withTiming(
            snapToOpen ? 0 : -DRAWER_WIDTH,
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