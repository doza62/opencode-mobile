import { useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '@/shared/services/logger';

const sessionLogger = logger.tag('Session');

export const useSessionManagement = (onCreateSession, deleteSession, onSessionSelect) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleCreateSession = async () => {
    if (creating) return;
    setCreating(true);
    try {
      await onCreateSession();
      setDropdownVisible(false);
    } catch (error) {
      sessionLogger.error('Create session failed', error);
    } finally {
      setCreating(false);
    }
  };

  const handleSessionSelect = (session) => {
    onSessionSelect(session);
    setDropdownVisible(false);
  };

  const handleDeleteSession = (session) => {
    Alert.alert(
      "Delete Session",
      `Are you sure you want to delete "${session.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSession(session.id);
              setDropdownVisible(false);
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to delete session. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  return {
    dropdownVisible,
    creating,
    toggleDropdown,
    handleCreateSession,
    handleSessionSelect,
    handleDeleteSession,
  };
};