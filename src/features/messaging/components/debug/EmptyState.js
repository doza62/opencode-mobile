/**
 * Empty state component for debug modal
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Current active tab ('classified' or 'unclassified')
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/components/ThemeProvider';

const EmptyState = ({ activeTab }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        No {activeTab} messages yet
      </Text>
      <Text style={styles.emptySubtext}>
        Messages will appear here when received
      </Text>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});

export default EmptyState;