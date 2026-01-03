import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { getProjectDisplayName } from '../utils/projectSelectionUtils';

/**
 * ProjectDropdown component - Compact dropdown visualization for project selection
 * @param {Object} props - Component props
 * @param {Array} props.projects - Array of available projects
 * @param {Object} props.selectedProject - Currently selected project
 * @param {Function} props.onProjectSelect - Function called when project is selected
 */
const ProjectDropdown = ({ projects, selectedProject, onProjectSelect }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.trigger}>
        <Text>{getProjectDisplayName(selectedProject)}</Text>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.dropdown}>
          <FlatList
            data={projects}
            keyExtractor={(item) => item.id.toString()}
             renderItem={({ item }) => (
               <TouchableOpacity onPress={() => { onProjectSelect(item); setExpanded(false); }} style={styles.item}>
                 <Text>{item.name}</Text>
               </TouchableOpacity>
             )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'relative' },
  trigger: { padding: 10, borderWidth: 1, borderRadius: 5 },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderWidth: 1, zIndex: 10 },
  item: { padding: 10 },
});

export default ProjectDropdown;