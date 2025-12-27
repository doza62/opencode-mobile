import React from 'react';
import { Svg, Path } from 'react-native-svg';

/**
 * SendIcon component - Monotone paper plane SVG icon
 * @param {Object} props - Component props
 * @param {string} props.color - Icon color (default: white)
 * @param {number} props.size - Icon size (default: 20)
 */
const SendIcon = ({ color = 'white', size = 20 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3L21 12L3 21L3 15L16 12L3 9L3 3Z"
        fill={color}
        stroke="none"
      />
    </Svg>
  );
};

export default SendIcon;