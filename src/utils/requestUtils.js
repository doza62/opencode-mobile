/**
 * Request utilities for opencode mobile app
 * Handles common headers and project path management
 */

/**
 * Get the full project path for x-opencode-directory header
 * @param {Object} selectedProject - Currently selected project object
 * @returns {string} - Full project directory path
 */
export const getProjectPath = (selectedProject = null) => {
  // Use selected project's directory/worktree path
  if (selectedProject && selectedProject.worktree) {
    return selectedProject.worktree;
  }
  if (selectedProject && selectedProject.directory) {
    return selectedProject.directory;
  }
  // Fallback to current app directory if no project selected
  return '/Users/rodri/Projects/opencode-mobile/opencode-mobile';
};

/**
 * Get common headers for all API requests
 * @param {Object} additionalHeaders - Additional headers to include
 * @param {Object} selectedProject - Currently selected project
 * @returns {Object} - Headers object with x-opencode-directory
 */
export const getRequestHeaders = (additionalHeaders = {}, selectedProject = null) => {
  return {
    'x-opencode-directory': getProjectPath(selectedProject),
    'Accept': 'application/json',
    ...additionalHeaders
  };
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