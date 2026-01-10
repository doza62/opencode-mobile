/**
 * Statistics row component for debug modal header
 * @param {Object} props - Component props
 * @param {Object} props.stats - Statistics object from useMessageCounts
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/components/ThemeProvider';

const StatsRow = ({ stats }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {stats.totalClassifiedMessages}
        </Text>
        <Text style={styles.statLabel}>Classified</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {stats.totalUnclassifiedMessages}
        </Text>
        <Text style={styles.statLabel}>Unclassified</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {stats.messageTypesCount}
        </Text>
        <Text style={styles.statLabel}>Types</Text>
      </View>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.border,
  },
});

export default StatsRow;