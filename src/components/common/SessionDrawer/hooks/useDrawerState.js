import { useCallback } from 'react';

/**
 * Hook for managing drawer state and close handling
 * @param {boolean} visible - Whether drawer is visible
 * @param {boolean} isPersistent - Whether drawer is persistent
 * @param {Function} openDrawer - Function to open drawer
 * @param {Function} closeDrawer - Function to close drawer
 * @param {Function} onClose - Callback when closing
 * @returns {Object} - State handlers
 */
const useDrawerState = (visible, isPersistent, openDrawer, closeDrawer, onClose) => {
  const handleClose = useCallback(() => {
    if (isPersistent) {
      // For persistent drawers, just call onClose
      onClose && onClose();
    } else {
      // For modal drawers, animate close then call onClose
      closeDrawer();
    }
  }, [isPersistent, closeDrawer, onClose]);

  return {
    handleClose,
  };
};

export { useDrawerState };