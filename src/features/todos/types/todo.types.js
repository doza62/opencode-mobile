/**
 * @typedef {Object} Todo
 * @property {string} id - Todo identifier
 * @property {string} content - Todo description
 * @property {string} status - Todo status (pending, in_progress, completed, cancelled)
 * @property {string} priority - Todo priority (low, medium, high, critical)
 */

/**
 * @typedef {Object} TodoState
 * @property {Array<Todo>} todos - Todo list
 * @property {boolean} expanded - Drawer expanded state
 */

/**
 * @typedef {Object} TodoActions
 * @property {Function} loadTodos - Load todos for session
 * @property {Function} setExpanded - Set drawer expanded state
 */

// Export empty object to make this a valid module
export {};