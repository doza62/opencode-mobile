import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';

/**
 * SessionDropdown - Session selection dropdown with CRUD operations
 */
const SessionDropdown = ({
  selectedSession,
  projectSessions,
  onSessionSelect,
  onCreateSession,
  deleteSession,
  onRefreshSession
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleCreateSession = async () => {
    try {
      const newSession = await onCreateSession();
      setDropdownVisible(false);
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
          setDropdownVisible(false);
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
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownTrigger}
        onPress={() => setDropdownVisible(true)}
      >
        <Text style={styles.sessionTitle} numberOfLines={1}>
          {selectedSession?.title || 'Select Session'}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateSession}
            >
              <Text style={styles.createButtonText}>+ New Session</Text>
            </TouchableOpacity>

            <FlatList
              data={projectSessions}
              keyExtractor={(item) => item.id}
              renderItem={renderSessionItem}
              style={styles.sessionList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxHeight: '70%',
  },
  createButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionList: {
    maxHeight: 300,
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
    padding: 12,
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
});

export default SessionDropdown;