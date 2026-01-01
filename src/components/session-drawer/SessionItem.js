import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../../shared/components/ThemeProvider';

const SessionItem = ({
  session,
  isActive,
  status,
  onSelect,
  onDelete,
}) => {
  const theme = useTheme();

  const handleDelete = () => {
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete "${session.name || 'Untitled Session'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const getStatusColor = () => {
    switch (status?.type) {
      case 'busy':
        return theme.colors.warning;
      case 'idle':
        return theme.colors.success;
      default:
        return theme.colors.textMuted;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isActive ? theme.colors.surfaceSecondary : theme.colors.surface,
          borderBottomColor: theme.colors.borderLight,
        },
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
           <Text
             style={[styles.title, { color: theme.colors.textPrimary }]}
             numberOfLines={1}
           >
             {session.title || session.name || 'Untitled Session'}
           </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Text style={[styles.deleteIcon, { color: theme.colors.error }]}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.meta}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
           <Text style={[styles.time, { color: theme.colors.textMuted }]}>
             {(() => {
               const date = new Date(session.time?.created || session.time?.updated);
               return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleTimeString([], {
                 hour: '2-digit',
                 minute: '2-digit'
               });
             })()}
           </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  deleteIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
  },
});

export default SessionItem;