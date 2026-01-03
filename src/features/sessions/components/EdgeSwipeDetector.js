import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

const EdgeSwipeDetector = ({ onOpenDrawer }) => {
  const onGestureEvent = (event) => {
    const { nativeEvent } = event;

    if (nativeEvent.state === State.ACTIVE && nativeEvent.x < 20) {
      if (onOpenDrawer) {
        runOnJS(onOpenDrawer)();
      }
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      activeOffsetX={[-20, 20]}
    >
      <View style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 20, // Only 20px wide strip
        zIndex: 1
      }} />
    </PanGestureHandler>
  );
};

export default EdgeSwipeDetector;