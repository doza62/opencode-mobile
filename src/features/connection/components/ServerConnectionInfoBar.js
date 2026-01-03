import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useConnectionStatus from '../hooks/useConnectionStatus';
import { formatStatusText, getStatusColor } from '../utils/connectionStatusUtils';
import { useTheme } from '@/shared/components/ThemeProvider';

/**
 * ServerConnectionInfoBar component - Expandable info bar visualization for server connection details
 * @param {Object} props - Component props
 */
const ServerConnectionInfoBar = () => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { isConnected, serverUrl, selectedProject, selectedSession } = useConnectionStatus();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection Info</Text>
      <Text style={styles.info}>Server: {serverUrl || 'N/A'}</Text>
      <Text style={styles.info}>Project: {selectedProject?.name || 'None'}</Text>
      <Text style={styles.info}>Session: {selectedSession?.title || 'None'}</Text>
      <Text style={[styles.status, { color: getStatusColor(isConnected) }]}>
        Status: {formatStatusText(isConnected)}
      </Text>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  info: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  status: {
    fontWeight: 'bold',
  },
});

export default ServerConnectionInfoBar;