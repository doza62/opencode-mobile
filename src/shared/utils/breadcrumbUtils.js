/**
 * Utility functions for breadcrumb parsing and generation
 */

/**
 * Parses path into breadcrumb segments
 * @param {string} path - Current path
 * @returns {Array} Breadcrumb items
 */
export const parseBreadcrumbs = (path) => {
  const segments = path.split('/').filter(Boolean);
  return segments.map((segment, index) => ({
    label: segment,
    path: '/' + segments.slice(0, index + 1).join('/'),
  }));
};

/**
 * Generates breadcrumb display text
 * @param {Object} breadcrumb - Breadcrumb item
 * @returns {string} Display text
 */
export const formatBreadcrumbText = (breadcrumb) => {
  return breadcrumb.label.replace('-', ' ').toUpperCase();
};