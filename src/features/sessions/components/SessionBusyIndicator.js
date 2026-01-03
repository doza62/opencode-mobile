import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useSessionStatus from '../hooks/useSessionStatus';
import { formatStatusText } from '../utils/sessionStatusUtils';

/**
 * SessionBusyIndicator component - Loading overlay visualization for busy state
 * @param {Object} props - Component props
 */
const SessionBusyIndicator = () => {
  const { isBusy } = useSessionStatus();

  if (!isBusy) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.text}>{formatStatusText(false, true)}</Text>
        <View style={styles.loader} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  loader: {
    width: 30,
    height: 30,
    borderWidth: 3,
    borderColor: '#007bff',
    borderTopColor: 'transparent',
    borderRadius: 15,
  },
});

export default SessionBusyIndicator;