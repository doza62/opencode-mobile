import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../shared/components/ThemeProvider';
import { getProjectDisplayName } from '../../features';

const ProjectDropdown = ({
  projects = [],
  selectedProject,
  visible = false,
  onSelect,
  onClose,
  isPersistent = false,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  console.log('ProjectDropdown render:', { visible, projectsCount: projects?.length, isPersistent });

  if (!visible) return null;

  console.log('ProjectDropdown rendering dropdown with topOffset:', topOffset);

  const topOffset = isPersistent ? insets.top + 100 : 100;

  const renderProjectItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.projectItem,
        {
          backgroundColor: selectedProject?.id === item.id ? theme.colors.surfaceSecondary : theme.colors.surface,
          borderBottomColor: theme.colors.borderLight,
        },
      ]}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.projectName, { color: theme.colors.textPrimary }]}
        numberOfLines={1}
      >
        {item.name || 'Unnamed Project'}
      </Text>
      <Text
        style={[styles.projectPath, { color: theme.colors.textSecondary }]}
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {item.worktree || item.directory || ''}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        activeOpacity={1}
      >
        <View style={[styles.container, { backgroundColor: theme.colors.surface, top: topOffset }]}>
          <FlatList
            data={projects}
            keyExtractor={(item) => item.id}
            renderItem={renderProjectItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No projects available
                </Text>
              </View>
            }
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 8,
    maxHeight: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  listContent: {
    paddingVertical: 8,
  },
  projectItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  projectPath: {
    fontSize: 12,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

export default ProjectDropdown;