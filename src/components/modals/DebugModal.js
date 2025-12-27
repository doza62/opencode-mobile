import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * DebugModal - Unclassified messages viewer
 */
const DebugModal = ({ visible, onClose, unclassifiedMessages }) => {
  const renderMessageItem = ({ item }) => (
    <View style={styles.messageItem}>
      <View style={styles.messageHeader}>
        <Text style={styles.messageType}>{item.type || 'unknown'}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <Text style={styles.messageContent}>{item.message || JSON.stringify(item)}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Unclassified Messages ({unclassifiedMessages.length})</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={unclassifiedMessages}
          keyExtractor={(item, index) => `${item.id || index}`}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No unclassified messages</Text>
              <Text style={styles.emptySubtext}>Messages that couldn't be categorized will appear here</Text>
            </View>
          }
        />
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
  listContainer: {
    padding: 16,
  },
  messageItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007bff',
    textTransform: 'uppercase',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  messageContent: {
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

export default DebugModal;