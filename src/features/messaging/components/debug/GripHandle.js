/**
 * Grip handle component for resizable drawer
 * @param {Object} props - Component props
 * @param {Function} props.onGestureEvent - Gesture event handler
 * @param {Function} props.onHandlerStateChange - Handler state change callback
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useTheme } from '@/shared/components/ThemeProvider';

const GripHandle = ({ onGestureEvent, onHandlerStateChange }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.gripContainer}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <View style={styles.gripHandle}>
          <View style={styles.gripIndicator}>
            <View style={styles.gripDot} />
            <View style={styles.gripDot} />
            <View style={styles.gripDot} />
          </View>
        </View>
      </PanGestureHandler>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  gripContainer: {
    width: '100%',
    height: 36,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  gripHandle: {
    width: 48,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gripIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 32,
    height: 4,
  },
  gripDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textMuted,
  },
});

export default GripHandle;