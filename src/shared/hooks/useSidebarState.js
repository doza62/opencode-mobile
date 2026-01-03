import { useState } from 'react';

/**
 * Custom hook for managing sidebar/drawer visibility state
 * @param {boolean} isWideScreen - Whether the screen is wide enough for sidebar
 * @returns {Object} Sidebar state and toggle function
 */
export const useSidebarState = (isWideScreen) => {
  const [sidebarVisible, setSidebarVisible] = useState(false); // Start closed, will be opened when project is selected
  const [sessionDrawerVisible, setSessionDrawerVisible] = useState(false);

  const toggleSidebar = () => {
    if (isWideScreen) {
      setSidebarVisible(!sidebarVisible);
    } else {
      setSessionDrawerVisible(!sessionDrawerVisible);
    }
  };

  return {
    sidebarVisible,
    sessionDrawerVisible,
    toggleSidebar,
    setSidebarVisible,
    setSessionDrawerVisible
  };
};