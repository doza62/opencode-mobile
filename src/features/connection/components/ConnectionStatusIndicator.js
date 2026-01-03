import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useConnectionStatus from '../hooks/useConnectionStatus';
import { formatStatusText, getStatusColor } from '../utils/connectionStatusUtils';

/**
 * ConnectionStatusIndicator component - Small badge/icon visualization for connection status
 * @param {Object} props - Component props
 */
const ConnectionStatusIndicator = () => {
  const { isConnected } = useConnectionStatus();

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: getStatusColor(isConnected) }]} />
      <Text style={styles.text}>{formatStatusText(isConnected)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  text: {
    fontSize: 12,
  },
});

export default ConnectionStatusIndicator;