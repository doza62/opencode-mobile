/**
 * useCommands Hook - Fetches and manages slash commands from the API
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchCommands } from '../services/commandService';
import { logger } from '@/shared/services/logger';

const apiLogger = logger.tag('API');

/**
 * Hook to fetch and manage slash commands
 * @param {string} baseUrl - Base URL of the server
 * @param {Object} selectedProject - Currently selected project
 * @returns {Object} Commands state and actions
 */
export const useCommands = (baseUrl, selectedProject) => {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCommands = useCallback(async () => {
    if (!baseUrl) return;

    setLoading(true);
    setError(null);

    try {
      const fetchedCommands = await fetchCommands(baseUrl, selectedProject);
      const commandNames = (fetchedCommands || []).map(c => c.name);
      apiLogger.debug('Loaded commands', { count: commandNames.length, commands: commandNames.join(', ') });
      setCommands(fetchedCommands || []);
    } catch (err) {
      apiLogger.warn('Failed to fetch commands, using fallback', { error: err.message });
      setError(err);
      setCommands([]);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, selectedProject]);

  useEffect(() => {
    loadCommands();
  }, [loadCommands]);

  return {
    commands,
    loading,
    error,
    refetch: loadCommands,
  };
};
