/**
 * @typedef {Object} Project
 * @property {string} id - Project identifier
 * @property {string} name - Project name
 * @property {string} worktree - Project worktree path
 * @property {string} directory - Project directory
 */

/**
 * @typedef {Object} Session
 * @property {string} id - Session identifier
 * @property {string} projectID - Associated project ID
 * @property {string} title - Session title
 * @property {Object} time - Timestamps
 * @property {number} time.created - Creation timestamp
 * @property {number} time.updated - Last update timestamp
 * @property {Object} [summary] - Session summary
 */

/**
 * @typedef {Object} ProjectState
 * @property {Array<Project>} projects - Available projects
 * @property {Array<Session>} projectSessions - Sessions for selected project
 * @property {Project|null} selectedProject - Currently selected project
 * @property {Session|null} selectedSession - Currently selected session
 * @property {boolean} loading - Loading state
 */

/**
 * @typedef {Object} ProjectActions
 * @property {Function} loadProjects - Load all projects
 * @property {Function} selectProject - Select a project
 * @property {Function} selectSession - Select a session
 * @property {Function} createSession - Create new session
 * @property {Function} deleteSession - Delete session
 */

// Export empty object to make this a valid module
export {};