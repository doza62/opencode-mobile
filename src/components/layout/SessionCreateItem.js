import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/components/ThemeProvider';

/**
 * Session create item component - shows "Create New Session" with loading state
 * @param {Object} props - Component props
 * @param {Function} props.onCreate - Function called when create is pressed
 * @param {boolean} props.creating - Whether creation is in progress
 */
const SessionCreateItem = ({ onCreate, creating }) => {
  const theme = useTheme();

  const styles = getStyles(theme);

  return (
    <TouchableOpacity
      style={[styles.sessionItem, styles.createItem]}
      onPress={onCreate}
      disabled={creating}
    >
      <View style={styles.sessionInfo}>
        <Text style={styles.createTitle}>
          {creating ? "Creating..." : "Create New Session"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (theme) => StyleSheet.create({
  sessionItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  createItem: {
    backgroundColor: theme.colors.primary,
  },
  sessionInfo: {
    padding: 12,
    alignItems: 'center',
  },
  createTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.surface,
  },
});

export default SessionCreateItem;