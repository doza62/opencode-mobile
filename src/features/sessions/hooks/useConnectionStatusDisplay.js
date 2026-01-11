import { useState, useEffect } from 'react';

/**
 * Custom hook for managing connection status display text auto-hide behavior
 * @param {boolean} isConnected - Whether the app is connected
 * @returns {Object} - Hook state and functions
 * @returns {boolean} showConnectedText - Whether to show "Connected" text
 * @returns {Function} resetConnectedText - Function to reset text visibility
 */
export const useConnectionStatusDisplay = (isConnected) => {
  const [showConnectedText, setShowConnectedText] = useState(true);

  useEffect(() => {
    if (isConnected && showConnectedText) {
      const timer = setTimeout(() => {
        setShowConnectedText(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (!isConnected) {
      setShowConnectedText(true);
    }
  }, [isConnected, showConnectedText]);

  const resetConnectedText = () => {
    setShowConnectedText(true);
  };

  return {
    showConnectedText,
    resetConnectedText,
  };
};