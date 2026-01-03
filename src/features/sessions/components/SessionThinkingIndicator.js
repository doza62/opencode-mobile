import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/shared/components/ThemeProvider';
import { getThinkingAnimation } from '../utils/sessionStatusUtils';

/**
 * SessionThinkingIndicator component - Spinning animation visualization for thinking state
 * @param {Object} props - Component props
 * @param {boolean} props.isThinking - Whether to show the thinking animation
 */
const SessionThinkingIndicator = ({ isThinking }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isThinking) {
      const animation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          ...getThinkingAnimation(),
        })
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isThinking, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!isThinking) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]} />
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    borderTopColor: 'transparent',
    borderRadius: 10,
  },
});

export default SessionThinkingIndicator;