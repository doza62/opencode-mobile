import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { getProjectDisplayName } from '../utils/projectSelectionUtils';
import { useTheme } from '@/shared/components/ThemeProvider';

/**
 * ProjectSelectorButton component - Button-triggered visualization for project selection
 * @param {Object} props - Component props
 * @param {Function} props.onPress - Function called when button is pressed
 * @param {Object} props.selectedProject - Currently selected project
 */
const ProjectSelectorButton = ({ onPress, selectedProject }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text style={styles.text}>{getProjectDisplayName(selectedProject)}</Text>
    </TouchableOpacity>
  );
};

const getStyles = (theme) => StyleSheet.create({
  button: { padding: 10, backgroundColor: theme.colors.accent, borderRadius: 5 },
  text: { color: theme.colors.background },
});

export default ProjectSelectorButton;