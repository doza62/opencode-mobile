import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { formatSessionTitle } from '../utils/sessionListUtils';
import { useTheme } from '@/shared/components/ThemeProvider';

/**
 * SessionListModal component - Modal container visualization for session list
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether modal is visible
 * @param {Array} props.sessions - Array of sessions to display
 * @param {Function} props.onSessionSelect - Function called when session is selected
 * @param {Function} props.onClose - Function called when modal should close
 * @param {Function} props.deleteSession - Function called to delete a session
 */
const SessionListModal = ({ visible, sessions = [], onSessionSelect, onClose, deleteSession }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const handleSelect = (session) => {
    onSessionSelect(session);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Select Session</Text>
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
             <TouchableOpacity onPress={() => handleSelect(item)} style={styles.item}>
               <Text style={styles.itemText}>{formatSessionTitle(item)}</Text>
             </TouchableOpacity>
          )}
        />
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: theme.colors.textPrimary },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  itemText: { color: theme.colors.textPrimary },
  closeButton: { marginTop: 20, padding: 10, backgroundColor: theme.colors.surface },
});

export default SessionListModal;