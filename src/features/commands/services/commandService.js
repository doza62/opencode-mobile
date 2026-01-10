/**
 * Command Service - API operations for slash commands
 */

import { apiClient } from '@/shared/services/api/client';

/**
 * Fetch all available commands from the server
 * @param {string} baseUrl - Base URL of the server
 * @param {Object} selectedProject - Currently selected project
 * @returns {Promise<Array<import('../types/command.types').Command>>} - Array of commands
 */
export const fetchCommands = async (baseUrl, selectedProject) => {
  if (!baseUrl) {
    throw new Error('Base URL is required to fetch commands');
  }

  const response = await apiClient.get(
    `${baseUrl}/command`,
    {},
    selectedProject
  );

  return response.json();
};
