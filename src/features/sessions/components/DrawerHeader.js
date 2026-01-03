import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, FlatList, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/components/ThemeProvider';
import { ProjectSelectorButton } from '@/features/projects/components';
import { ProjectSelectionModal } from '@/features/projects/components';
import { getProjectDisplayName } from '@/shared';
import { createStyles } from './styles';
import Svg, { Path } from 'react-native-svg';

const DrawerHeader = ({
  selectedProject,
  projects = [],
  onProjectSelect,
  onClose,
  isPersistent,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [projectDropdownVisible, setProjectDropdownVisible] = useState(false);

  console.debug('DrawerHeader render:', { projectsCount: projects?.length, selectedProject: !!selectedProject, dropdownVisible, projectDropdownVisible, isPersistent });

  const handleProjectPress = () => {
    console.debug('DrawerHeader: handleProjectPress called, setting dropdownVisible to true');
    setDropdownVisible(true);
  };

  const handleProjectSelect = (project) => {
    onProjectSelect(project);
    setDropdownVisible(false);
  };

  const handleProjectDropdownPress = () => {
    setProjectDropdownVisible(!projectDropdownVisible);
  };

  const handleProjectDropdownSelect = (project) => {
    onProjectSelect(project);
    setProjectDropdownVisible(false);
  };

  const renderProjectItem = ({ item: project }) => {
    const isActive = selectedProject?.id === project.id;
    const fullPath = project.worktree || project.directory;
    const lastUpdated = project.time?.updated ? new Date(project.time.updated).toLocaleDateString() : 'Unknown';

    return (
      <TouchableOpacity
        style={[styles.projectItem, isActive && styles.activeProjectItem]}
        onPress={() => handleProjectDropdownSelect(project)}
      >
        <View style={styles.projectInfo}>
          <View style={styles.projectHeader}>
            <Text style={[styles.projectItemTitle, isActive && styles.activeProjectTitle]}>
              {getProjectDisplayName(project.worktree) || 'Unnamed Project'}
            </Text>
            {project.vcs && (
              <View style={styles.vcsBadge}>
                <Text style={styles.vcsBadgeText}>{project.vcs.toUpperCase()}</Text>
              </View>
            )}
          </View>
          <View style={styles.projectFooter}>
            <Text style={styles.projectPath} numberOfLines={1}>{fullPath}</Text>
            <Text style={styles.lastUpdated}>Updated: {lastUpdated}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.drawerHeader}>
      <TouchableOpacity
        style={styles.projectSelector}
        onPress={handleProjectDropdownPress}
      >
        <Svg width="16" height="16" viewBox="0 0 24 24" style={[styles.dropdownIcon, {
          transform: [{ rotate: projectDropdownVisible ? '90deg' : '0deg' }]
        }]}>
          <Path d="M5 5 L15 12 L5 19" stroke={theme.colors.textSecondary} strokeWidth="3" fill="none" />
        </Svg>
        <Text style={[styles.projectTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {selectedProject ? getProjectDisplayName(selectedProject.worktree) : 'Select Project'}
        </Text>
      </TouchableOpacity>

      {!isPersistent && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <View style={styles.closeIcon}>
            <View style={[styles.closeLine, { backgroundColor: theme.colors.textSecondary, transform: [{ rotate: '45deg' }] }]} />
            <View style={[styles.closeLine, { backgroundColor: theme.colors.textSecondary, transform: [{ rotate: '-45deg' }] }]} />
          </View>
        </TouchableOpacity>
      )}

      {/* Project Selection Modal (existing) */}
      <ProjectSelectionModal
        visible={dropdownVisible}
        onClose={() => setDropdownVisible(false)}
        projects={projects}
        onProjectSelect={handleProjectSelect}
        selectedProject={selectedProject}
      />

      {/* Project Dropdown Modal (new) */}
      <Modal
        visible={projectDropdownVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setProjectDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setProjectDropdownVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownHeader}>
              Change Project
            </Text>
            <FlatList
              data={projects}
              keyExtractor={(item) => item.id}
              renderItem={renderProjectItem}
              style={styles.projectList}
              contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 16, paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default DrawerHeader;