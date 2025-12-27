import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * BreadcrumbNavigation - Shows project/session breadcrumb navigation
 */
const BreadcrumbNavigation = ({
  selectedProject,
  selectedSession,
  onProjectPress,
  onSessionPress
}) => {
  return (
    <View style={styles.container}>
      {/* Project breadcrumb */}
      <TouchableOpacity
        style={styles.breadcrumbItem}
        onPress={onProjectPress}
        disabled={!selectedProject}
      >
        <Text style={[styles.breadcrumbText, !selectedProject && styles.breadcrumbTextDisabled]}>
          {selectedProject ? selectedProject.name : 'Select Project'}
        </Text>
        <Text style={styles.breadcrumbSeparator}>›</Text>
      </TouchableOpacity>

      {/* Session breadcrumb */}
      <TouchableOpacity
        style={styles.breadcrumbItem}
        onPress={onSessionPress}
        disabled={!selectedSession}
      >
        <Text style={[styles.breadcrumbText, !selectedSession && styles.breadcrumbTextDisabled]}>
          {selectedSession ? selectedSession.title || 'Untitled Session' : 'Select Session'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  breadcrumbTextDisabled: {
    color: '#6c757d',
  },
  breadcrumbSeparator: {
    fontSize: 16,
    color: '#6c757d',
    marginHorizontal: 8,
  },
});

export default BreadcrumbNavigation;