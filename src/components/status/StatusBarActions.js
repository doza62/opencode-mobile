import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Svg, Path } from 'react-native-svg';

/**
 * StatusBarActions - Control buttons for the status bar
 */
const StatusBarActions = ({
  onRefreshSession,
  isSessionBusy
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onRefreshSession}
        disabled={isSessionBusy}
      >
        <Svg width="16" height="16" viewBox="0 0 24 24">
          <Path
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            stroke={isSessionBusy ? "#ccc" : "#666"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
});

export default StatusBarActions;