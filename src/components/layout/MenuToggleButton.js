import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/components/ThemeProvider';
import Svg, { Path } from 'react-native-svg';

/**
 * Menu toggle button component - hamburger/close icon for sidebar
 * @param {Object} props - Component props
 * @param {Function} props.onMenuPress - Function called when menu button is pressed
 * @param {boolean} props.isWideScreen - Whether the screen is wide enough for sidebar
 * @param {boolean} props.sidebarVisible - Whether the sidebar is currently visible
 * @param {Object} props.style - Custom style for the button
 */
const MenuToggleButton = ({ onMenuPress, isWideScreen, sidebarVisible, style }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity style={style} onPress={onMenuPress}>
      {isWideScreen && sidebarVisible ? (
        // Close icon (X) when sidebar is open on wide screens
        <Svg width={16} height={16} viewBox="0 0 24 24">
          <Path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill={theme.colors.textSecondary} />
        </Svg>
      ) : (
        // Hamburger icon (default)
        <Svg width={16} height={16} viewBox="0 0 24 24">
          <Path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill={theme.colors.textSecondary} />
        </Svg>
      )}
    </TouchableOpacity>
  );
};

export default MenuToggleButton;