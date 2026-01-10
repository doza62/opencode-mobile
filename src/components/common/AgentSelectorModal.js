import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/components/ThemeProvider';
import { getAgentColor } from '@/shared/utils/agentColorUtils';

/**
 * AgentSelectorModal - Modal for selecting agents
 */
const AgentSelectorModal = ({ visible, agents, selectedIndex, onSelect, onClose }) => {
  const theme = useTheme();

  const renderAgentItem = ({ item, index }) => {
    const isSelected = index === selectedIndex;
    const color = getAgentColor(item, index, theme.isDark ? 'dark' : 'light');

    return (
      <TouchableOpacity
        style={[styles.agentItem, isSelected && styles.selectedItem]}
        onPress={() => {
          onSelect(index);
          onClose();
        }}
      >
        <View style={[styles.colorIndicator, { backgroundColor: color }]} />
        <Text style={[styles.agentName, { color: theme.colors.textPrimary }]}>
          {item.name}
        </Text>
        {isSelected && <Text style={styles.selectedText}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Select Agent</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: theme.colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={agents}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderAgentItem}
          contentContainerStyle={styles.listContainer}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 18,
  },
  listContainer: {
    padding: 16,
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedItem: {
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  agentName: {
    flex: 1,
    fontSize: 16,
  },
  selectedText: {
    fontSize: 16,
    color: '#007bff',
  },
});

export default AgentSelectorModal;