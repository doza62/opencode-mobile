/**
 * @typedef {Object} Project
 * @property {string} id - Project identifier
 * @property {string} name - Project name
 * @property {string} worktree - Project worktree path
 * @property {string} directory - Project directory
 */



/**
 * @typedef {Object} ProjectState
 * @property {Array<Project>} projects - Available projects
 * @property {Array<import('../../../shared/types/opencode.types.js').Session>} projectSessions - Sessions for selected project
 * @property {Project|null} selectedProject - Currently selected project
 * @property {import('../../../shared/types/opencode.types.js').Session|null} selectedSession - Currently selected session
 * @property {boolean} loading - Loading state
 */

/**
 * @typedef {Object} ProjectActions
 * @property {Function} loadProjects - Load all projects
 * @property {Function} selectProject - Select a project
 * @property {Function} selectSession - Select a session (session: import('../../../shared/types/opencode.types.js').Session)
 * @property {Function} createSession - Create new session
 * @property {Function} deleteSession - Delete session (sessionId: string)
 */

// Export empty object to make this a valid module
export {};