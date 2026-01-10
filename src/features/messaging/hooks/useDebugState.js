/**
 * Hook for managing debug modal internal state
 * @returns {Object} State and handlers for debug modal
 */
import { useState, useCallback } from 'react';

export const useDebugState = () => {
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = useCallback((type) => {
    setExpandedGroups(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  }, []);

  const expandGroup = useCallback((type) => {
    setExpandedGroups(prev => ({
      ...prev,
      [type]: true
    }));
  }, []);

  const collapseGroup = useCallback((type) => {
    setExpandedGroups(prev => ({
      ...prev,
      [type]: false
    }));
  }, []);

  const collapseAllGroups = useCallback(() => {
    setExpandedGroups({});
  }, []);

  const isGroupExpanded = useCallback((type) => {
    return !!expandedGroups[type];
  }, [expandedGroups]);

  const resetState = useCallback(() => {
    setExpandedGroups({});
  }, []);

  return {
    expandedGroups,
    toggleGroup,
    expandGroup,
    collapseGroup,
    collapseAllGroups,
    isGroupExpanded,
    resetState
  };
};