/**
 * Request utilities for opencode mobile app
 * Handles common headers and project path management
 */
import { logger } from '@/shared/services/logger';

const apiLogger = logger.tag('API');

/**
 * Get the full project path for x-opencode-directory header
 * @param {Object} selectedProject - Currently selected project object
 * @returns {string} - Full project directory path
 */
export const getProjectPath = (selectedProject = null) => {
  if (selectedProject && selectedProject.worktree) {
    return selectedProject.worktree;
  }
  if (selectedProject && selectedProject.directory) {
    return selectedProject.directory;
  }
  apiLogger.warn('No worktree or directory found for project', { projectId: selectedProject?.id });
  return '';
};

/**
 * Get common headers for all API requests
 * @param {Object} additionalHeaders - Additional headers to include
 * @param {Object} selectedProject - Currently selected project
 * @returns {Object} - Headers object with x-opencode-directory
 */
export const getRequestHeaders = (additionalHeaders = {}, selectedProject = null) => {
  const headers = {
    'Accept': 'application/json',
    ...additionalHeaders
  };
  
  const projectPath = getProjectPath(selectedProject);
  if (projectPath) {
    headers['x-opencode-directory'] = projectPath;
  }
  
  return headers;
};

/**
 * Enhanced fetch with automatic header inclusion
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {Object} selectedProject - Currently selected project
 * @returns {Promise} - Fetch response
 */
export const opencodeFetch = async (url, options = {}, selectedProject = null) => {
  const headers = getRequestHeaders(options.headers || {}, selectedProject);
  return fetch(url, {
    ...options,
    headers
  });
};