import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import useSessionStatus from '../hooks/useSessionStatus';
import { formatStatusText, getStatusIcon, getThinkingAnimation } from '../utils/sessionStatusUtils';

/**
 * SessionStatusIndicator component - Text/icon combo visualization for session status
 * @param {Object} props - Component props
 */
const SessionStatusIndicator = () => {
  const { isThinking, isBusy } = useSessionStatus();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{getStatusIcon(isThinking, isBusy)}</Text>
      <Text style={styles.text}>{formatStatusText(isThinking, isBusy)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 4,
  },
  text: {
    fontSize: 14,
  },
});

export default SessionStatusIndicator;