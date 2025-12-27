import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * ConnectionStatusIndicator - Shows connection status dot and text
 */
const ConnectionStatusIndicator = ({
  isConnected,
  isConnecting,
  isServerReachable
}) => {
  const getStatusInfo = () => {
    if (isConnecting) {
      return { color: '#ffc107', text: 'Connecting...' };
    }
    if (isConnected) {
      return { color: '#28a745', text: 'Connected' };
    }
    if (isServerReachable === false) {
      return { color: '#dc3545', text: 'Server unreachable' };
    }
    return { color: '#6c757d', text: 'Disconnected' };
  };

  const { color, text } = getStatusInfo();

  return (
    <View style={styles.container}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ConnectionStatusIndicator;