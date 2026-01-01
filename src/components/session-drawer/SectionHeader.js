import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../shared/components/ThemeProvider';

const SectionHeader = ({ title, hasInlineNewSession, onCreateSession }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
          {title}
        </Text>
      </View>
      {hasInlineNewSession && (
        <TouchableOpacity
          style={styles.button}
          onPress={onCreateSession}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: theme.colors.success }]}>
            New Session
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  left: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SectionHeader;