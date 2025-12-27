// Feature modules - centralized exports
export { useSSEConnection, useConnectionManager, useAppState } from './connection';
export { useMessageProcessing, useEventManager } from './messaging';
export { useProjectManager } from './projects';
export { useModelManager } from './models';
export { useTodoManager } from './todos';
export { useNotificationManager } from './notifications';

// Commonly used utility functions
export {
  getProjectDisplayName,
  getSessionSummaryText,
  formatSessionDate
} from './projects/services/projectService';

export {
  sendMessageToSession,
  clearSession,
  hasActiveSession,
  setCurrentSession,
  deleteSession
} from './projects/services/sessionService';