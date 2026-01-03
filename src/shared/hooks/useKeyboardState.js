import { useState, useEffect } from 'react';
import { Keyboard, Dimensions } from 'react-native';

/**
 * Custom hook for managing keyboard state and type detection
 * @returns {Object} Keyboard state and detection info
 */
export const useKeyboardState = () => {
  const [keyboardState, setKeyboardState] = useState({
    isVisible: false,
    isFloating: false,
    height: 0,
    position: { x: 0, y: 0, width: 0, height: 0 }
  });

  const { height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', (e) => {
      const { screenY, height, screenX, width: keyboardWidth } = e.endCoordinates;
      // Docked keyboard is typically at bottom of screen
      // Floating keyboard appears higher up
      const isFloating = screenY < screenHeight - height - 50; // 50pt tolerance

       setKeyboardState({
         isVisible: true,
         isFloating,
         height,
         position: { x: screenX, y: screenY, width: keyboardWidth, height }
       });
    });

    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardState(prev => ({ ...prev, isVisible: false }));
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [screenHeight]);

  return keyboardState;
};