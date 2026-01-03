/**
 * Utility functions for project selection formatting and filtering
 */

/**
 * Filters projects by search query
 * @param {Array} projects - List of projects
 * @param {string} query - Search query
 * @returns {Array} Filtered projects
 */
export const filterProjects = (projects, query) => {
  if (!query) return projects;
  return projects.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase())
  );
};

/**
 * Sorts projects alphabetically
 * @param {Array} projects - List of projects
 * @returns {Array} Sorted projects
 */
export const sortProjects = (projects) => {
  return [...projects].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Gets display name for project
 * @param {Object} project - Project object
 * @returns {string} Display name
 */
export const getProjectDisplayName = (project) => {
  return project?.name || 'Select Project';
};