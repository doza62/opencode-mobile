import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * SessionSelectionModal - Session browser and selector
 */
const SessionSelectionModal = ({
  visible,
  onClose,
  sessions,
  onSessionSelect,
  selectedSession,
  onCreateSession,
  deleteSession
}) => {
  const handleCreateSession = async () => {
    try {
      const newSession = await onCreateSession();
      onSessionSelect(newSession);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to create session: ' + error.message);
    }
  };

  const handleDeleteSession = (session) => {
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete "${session.title || 'Untitled Session'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSession(session.id)
        }
      ]
    );
  };

  const renderSessionItem = ({ item }) => (
    <View style={styles.sessionItem}>
      <TouchableOpacity
        style={[
          styles.sessionContent,
          selectedSession?.id === item.id && styles.sessionContentSelected
        ]}
        onPress={() => {
          onSessionSelect(item);
          onClose();
        }}
      >
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle} numberOfLines={1}>
            {item.title || 'Untitled Session'}
          </Text>
          <Text style={styles.sessionDate}>
            {new Date(item.time?.created || item.created).toLocaleDateString()}
          </Text>
        </View>
        {selectedSession?.id === item.id && (
          <Text style={styles.selectedIndicator}>✓</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteSession(item)}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Session</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.createContainer}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateSession}>
            <Text style={styles.createButtonText}>+ New Session</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSessionItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No sessions available</Text>
              <Text style={styles.emptySubtext}>Create a new session to get started</Text>
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
  createContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  createButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  sessionContentSelected: {
    borderColor: '#007bff',
    backgroundColor: '#f8f9ff',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: '#666',
  },
  selectedIndicator: {
    fontSize: 18,
    color: '#007bff',
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 16,
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

export default SessionSelectionModal;