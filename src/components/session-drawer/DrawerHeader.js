import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../shared/components/ThemeProvider';
import ProjectSelector from './ProjectSelector';
import ProjectSelectionModal from '../modals/ProjectSelectionModal';

const DrawerHeader = ({
  selectedProject,
  projects = [],
  onProjectSelect,
  onClose,
  isPersistent,
}) => {
  const theme = useTheme();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  console.log('DrawerHeader render:', { projectsCount: projects?.length, selectedProject: !!selectedProject, dropdownVisible, isPersistent });

  const handleProjectPress = () => {
    console.log('DrawerHeader: handleProjectPress called, setting dropdownVisible to true');
    setDropdownVisible(true);
  };

  const handleProjectSelect = (project) => {
    onProjectSelect(project);
    setDropdownVisible(false);
  };

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border }]}>
      <ProjectSelector
        selectedProject={selectedProject}
        onPress={handleProjectPress}
      />
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

      <ProjectSelectionModal
        visible={dropdownVisible}
        onClose={() => setDropdownVisible(false)}
        projects={projects}
        onProjectSelect={handleProjectSelect}
        selectedProject={selectedProject}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    width: 16,
    height: 16,
    position: 'relative',
  },
  closeLine: {
    position: 'absolute',
    width: 16,
    height: 2,
    left: 0,
    top: 7,
  },
});

export default DrawerHeader;