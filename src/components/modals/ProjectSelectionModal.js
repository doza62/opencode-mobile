import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * ProjectSelectionModal - Project browser and selector
 */
const ProjectSelectionModal = ({ visible, onClose, projects, onProjectSelect, selectedProject }) => {
  const renderProjectItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.projectItem,
        selectedProject?.id === item.id && styles.projectItemSelected
      ]}
      onPress={() => {
        onProjectSelect(item);
        onClose();
      }}
    >
      <View style={styles.projectInfo}>
        <Text style={styles.projectName}>{item.name || 'Unnamed Project'}</Text>
        <Text style={styles.projectPath}>{item.worktree || item.directory}</Text>
      </View>
      {selectedProject?.id === item.id && (
        <Text style={styles.selectedIndicator}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Project</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={renderProjectItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No projects available</Text>
              <Text style={styles.emptySubtext}>Make sure the server is running and has projects configured</Text>
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
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  projectItemSelected: {
    borderColor: '#007bff',
    backgroundColor: '#f8f9ff',
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  projectPath: {
    fontSize: 12,
    color: '#666',
  },
  selectedIndicator: {
    fontSize: 18,
    color: '#007bff',
    fontWeight: 'bold',
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

export default ProjectSelectionModal;