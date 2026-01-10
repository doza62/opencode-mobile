/**
 * Hook for managing debug modal tab state
 * @param {string} initialTab - Initial active tab ('classified', 'unclassified', or 'messageId')
 * @returns {Object} Tab state and handlers
 */
import { useState, useCallback } from 'react';

export const useDebugTabs = (initialTab = 'classified') => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const switchToClassified = useCallback(() => {
    setActiveTab('classified');
  }, []);

  const switchToUnclassified = useCallback(() => {
    setActiveTab('unclassified');
  }, []);

  const switchToMessageId = useCallback(() => {
    setActiveTab('messageId');
  }, []);

  const setTab = useCallback((tab) => {
    if (tab === 'classified' || tab === 'unclassified' || tab === 'messageId') {
      setActiveTab(tab);
    }
  }, []);

  return {
    activeTab,
    setActiveTab: setTab,
    switchToClassified,
    switchToUnclassified,
    switchToMessageId,
    isClassifiedTab: activeTab === 'classified',
    isUnclassifiedTab: activeTab === 'unclassified',
    isMessageIdTab: activeTab === 'messageId'
  };
};