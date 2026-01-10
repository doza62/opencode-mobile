// hooks.js - Custom hooks for session drawer
import { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { logger } from '@/shared/services/logger';

const drawerLogger = logger.tag('DrawerAnimation');

const EDGE_ZONE_WIDTH = 20;
const GESTURE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 400;
const DRAWER_WIDTH = 320;

export const useDrawerAnimation = (isPersistent, onClose) => {
  const initialTranslateX = isPersistent ? 0 : -DRAWER_WIDTH;

  const translateX = useSharedValue(initialTranslateX);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const openDrawer = () => {
    drawerLogger.debug('Opening drawer');
    translateX.value = withTiming(0, { duration: 300 });
  };

  const closeDrawer = () => {
    const closePosition = -DRAWER_WIDTH;
    drawerLogger.debug('Closing drawer', { position: closePosition });
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
  return {
    expandedParents: new Set(),
    toggleExpanded: (parentId) => {},
  };
};