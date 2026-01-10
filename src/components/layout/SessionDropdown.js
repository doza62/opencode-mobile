import React from 'react';
import { View, Modal, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/shared/components/ThemeProvider';
import SessionListItem from './SessionListItem';
import SessionCreateItem from './SessionCreateItem';

/**
 * Session dropdown modal component with session list
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether modal is visible
 * @param {Function} props.onClose - Function called to close modal
 * @param {Array} props.projectSessions - Array of available sessions
 * @param {import('@/shared/types/opencode.types.js').Session|null} props.selectedSession - Currently selected session
 * @param {Function} props.onSessionSelect - Function called when session is selected
 * @param {Function} props.onCreateSession - Function called to create new session
 * @param {Function} props.onDeleteSession - Function called to delete session
 * @param {boolean} props.creating - Whether session creation is in progress
 */
const SessionDropdown = ({
  visible,
  onClose,
  projectSessions,
  selectedSession,
  onSessionSelect,
  onCreateSession,
  onDeleteSession,
  creating,
}) => {
  const theme = useTheme();

  const styles = getStyles(theme);

  // Prepare data for FlatList with create item first
  const sessionData = [
    { type: 'create' },
    ...projectSessions,
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'create') {
      return (
        <SessionCreateItem
          onCreate={onCreateSession}
          creating={creating}
        />
      );
    }

    const isActive = selectedSession && selectedSession.id === item.id;
    return (
      <SessionListItem
        session={item}
        isActive={isActive}
        onSelect={onSessionSelect}
        onDelete={onDeleteSession}
      />
    );
  };

  const keyExtractor = (item) => {
    return item.type === 'create' ? 'create' : item.id;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.dropdown}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Select Session</Text>
          </View>
          <FlatList
            data={sessionData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const getStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceSecondary,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  list: {
    maxHeight: 300,
  },
});

export default SessionDropdown;