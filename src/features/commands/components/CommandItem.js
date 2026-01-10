import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/components/ThemeProvider';

const CommandItem = React.memo(({ command, isAutocomplete, onPress }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <TouchableOpacity
      style={[styles.container, isAutocomplete && styles.autocompleteContainer]}
      onPress={() => onPress(command)}
      activeOpacity={0.7}
    >
      <Text style={styles.commandText}>
        <Text style={styles.commandName}>/{command.name}</Text>
        <Text style={styles.separator}> - </Text>
        <Text style={styles.commandDescription}>{command.description}</Text>
      </Text>
      {isAutocomplete && (
        <View style={styles.tabHint}>
          <Text style={styles.tabHintText}>TAB</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const getStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  autocompleteContainer: {
    backgroundColor: theme.colors.surfaceHover || theme.colors.border + '20',
  },
  commandText: {
    flex: 1,
    fontSize: 14,
  },
  commandName: {
    color: theme.colors.accent,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  separator: {
    color: theme.colors.textMuted,
  },
  commandDescription: {
    color: theme.colors.textSecondary,
  },
  tabHint: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  tabHintText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
});

CommandItem.displayName = 'CommandItem';

export default CommandItem;
