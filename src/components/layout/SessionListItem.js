import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/components/ThemeProvider';
import { SessionBusyIndicator } from '@/features/sessions/components';

/**
 * Individual session list item component
 * @param {Object} props - Component props
 * @param {import('@/shared/types/opencode.types.js').Session} props.session - Session data
 * @param {boolean} props.isActive - Whether this session is currently active
 * @param {Function} props.onSelect - Function called when session is selected
 * @param {Function} props.onDelete - Function called when delete button is pressed
 */
const SessionListItem = ({ session, isActive, onSelect, onDelete }) => {
  const theme = useTheme();

  const styles = getStyles(theme);

  return (
    <View style={[styles.sessionItem, isActive && styles.activeSessionItem]}>
      <TouchableOpacity
        style={styles.sessionContent}
        onPress={() => onSelect(session)}
      >
        <View style={styles.sessionInfo}>
          <Text style={[styles.sessionTitle, isActive && styles.activeSessionTitle]}>
            {session.title || "Untitled Session"}
          </Text>
          {session.time?.created && (
            <Text style={styles.sessionDate}>
              {new Date(session.time.created).toLocaleDateString()}
            </Text>
          )}
        </View>
        <View style={styles.sessionActions}>
          <SessionBusyIndicator isBusy={false} />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(session)}
          >
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  sessionItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  activeSessionItem: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  sessionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  activeSessionTitle: {
    color: theme.colors.primary,
  },
  sessionDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  sessionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteText: {
    fontSize: 18,
    color: theme.colors.error,
    fontWeight: 'bold',
  },
});

export default SessionListItem;