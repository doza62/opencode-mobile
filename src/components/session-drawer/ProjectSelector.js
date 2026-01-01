import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../shared/components/ThemeProvider';

const ProjectSelector = ({ selectedProject, onPress }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceSecondary,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.text, { color: theme.colors.textPrimary }]}
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {selectedProject?.name || 'Select Project'}
      </Text>
      <Text style={[styles.arrow, { color: theme.colors.textSecondary }]}>
        ▼
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    marginLeft: 8,
  },
});

export default ProjectSelector;