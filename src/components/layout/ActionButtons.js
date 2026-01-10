import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/components/ThemeProvider';
import Svg, { Path } from 'react-native-svg';

/**
 * Action buttons component - settings and debug buttons
 * @param {Object} props - Component props
 * @param {Function} props.onToggleInfoBar - Function called when settings button is pressed
 * @param {Function} props.onDebugPress - Function called when debug button is pressed
 */
const ActionButtons = ({ onToggleInfoBar, onDebugPress }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingsButton: {
      padding: 8,
      marginRight: 8,
    },
    debugButton: {
      padding: 8,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.settingsButton} onPress={onToggleInfoBar}>
        <Svg width="16" height="16" viewBox="0 0 24 24">
          <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill={theme.colors.textSecondary} />
        </Svg>
      </TouchableOpacity>
      <TouchableOpacity style={styles.debugButton} onPress={onDebugPress}>
        <Svg width="16" height="16" viewBox="0 0 24 24">
          <Path d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5s-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z" fill={theme.colors.textSecondary} />
        </Svg>
      </TouchableOpacity>
    </View>
  );
};

export default ActionButtons;