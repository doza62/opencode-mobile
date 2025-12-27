import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * LogModal - Application logs viewer
 */
const LogModal = ({ visible, onClose }) => {
  // Placeholder for logs - in a real implementation, this would come from a logging service
  const logs = [
    { id: 1, level: 'INFO', message: 'Application started', timestamp: new Date().toISOString() },
    { id: 2, level: 'INFO', message: 'Connected to server', timestamp: new Date().toISOString() },
    { id: 3, level: 'WARN', message: 'Slow network detected', timestamp: new Date().toISOString() },
  ];

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'ERROR': return '#dc3545';
      case 'WARN': return '#ffc107';
      case 'INFO': return '#007bff';
      case 'DEBUG': return '#6c757d';
      default: return '#333';
    }
  };

  const renderLogItem = (log) => (
    <View key={log.id} style={styles.logItem}>
      <View style={styles.logHeader}>
        <Text style={[styles.logLevel, { color: getLogLevelColor(log.level) }]}>
          {log.level}
        </Text>
        <Text style={styles.logTime}>
          {new Date(log.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <Text style={styles.logMessage}>{log.message}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Application Logs</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          {logs.length > 0 ? (
            logs.map(renderLogItem)
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No logs available</Text>
              <Text style={styles.emptySubtext}>Application logs will appear here</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 18,
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  logItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logLevel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  logTime: {
    fontSize: 12,
    color: '#666',
  },
  logMessage: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default LogModal;