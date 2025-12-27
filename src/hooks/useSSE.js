// SSE orchestrator - combines all feature modules
import { useState, useCallback } from 'react';
import {
  useSSEConnection,
  useConnectionManager,
  useAppState,
  useMessageProcessing,
  useEventManager,
  useProjectManager,
  useModelManager,
  useTodoManager,
  useNotificationManager
} from '../features';
import { sendMessageToSession, clearSession, hasActiveSession, setCurrentSession, deleteSession } from '../features';

export const useSSE = (initialUrl = 'http://10.1.1.122:63425') => {
  // Core state
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [baseUrl, setBaseUrl] = useState(null);
  const [currentMode, setCurrentMode] = useState('build');

  // Feature modules
  const connection = useSSEConnection(baseUrl);
  const connectionMgr = useConnectionManager();
  const appState = useAppState(null); // Will be updated with selected session

  const messaging = useMessageProcessing();
  const projects = useProjectManager(baseUrl);
  const models = useModelManager(baseUrl, projects.selectedProject);
  const todos = useTodoManager(baseUrl, projects.selectedSession?.id);
  const notifications = useNotificationManager();

  // Event manager for SSE messages
  const eventManager = useEventManager(
    (message) => messaging.processMessage(message, currentMode),
    projects.selectedSession
  );

  // Connect to server
  const connectToEvents = useCallback(async () => {
    try {
      const cleanUrl = await connectionMgr.validateAndConnect(inputUrl);
      setBaseUrl(cleanUrl);
      await connection.connect();
      await projects.loadProjects();
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }, [inputUrl, connectionMgr, connection, projects]);

  // Disconnect from server
  const disconnectFromEvents = useCallback(() => {
    connection.disconnect();
    messaging.clearEvents();
    projects.selectProject(null);
    setBaseUrl(null);
    clearSession();
  }, [connection, messaging, projects]);

  // Send message
  const sendMessage = useCallback(async (messageText, mode = 'build') => {
    if (!connection.isConnected || !hasActiveSession()) {
      throw new Error('Cannot send message: not connected or no session selected');
    }

    if (!messageText || !messageText.trim()) {
      throw new Error('Cannot send empty message');
    }

    setCurrentMode(mode);

    // Add sent message to UI immediately
    const sentMessageId = messaging.generateMessageId();
    messaging.addEvent({
      id: sentMessageId,
      type: 'sent',
      category: 'sent',
      message: messageText,
      projectName: 'Me',
      icon: 'User',
      timestamp: new Date().toISOString(),
      mode: mode
    });

    try {
      // Send to server
      const response = await sendMessageToSession(messageText, mode, projects.selectedProject, models.selectedModel);

      // Update UI state
      todos.setExpanded(false);

      return response;
    } catch (error) {
      console.error('Message send failed:', error);

      // Remove failed message from UI
      messaging.clearEvents(); // Simplified - in real implementation, remove specific message

      throw error;
    }
  }, [connection.isConnected, messaging, projects.selectedProject, models.selectedModel, todos, currentMode]);

  // Clear error (placeholder)
  const clearError = useCallback(() => {
    // Error state management would be added here
  }, []);

  // Load models
  const loadModels = useCallback(async () => {
    await models.loadModels();
  }, [models]);

  // Select model
  const onModelSelect = useCallback(async (providerId, modelId) => {
    await models.selectModel(providerId, modelId);
  }, [models]);

  // Session management
  const selectProject = useCallback(async (project) => {
    await projects.selectProject(project);
  }, [projects]);

  const selectSession = useCallback((session) => {
    projects.selectSession(session);
  }, [projects]);

  const createSession = useCallback(async () => {
    return await projects.createSession();
  }, [projects]);

  const deleteSessionById = useCallback(async (sessionId) => {
    await projects.deleteSession(sessionId);
  }, [projects]);

  const refreshSession = useCallback(() => {
    // Placeholder - would reload current session data
    console.log('Refresh session not implemented yet');
  }, []);

  // Return unified interface (backward compatible)
  return {
    // Connection state
    events: messaging.events,
    unclassifiedMessages: messaging.unclassifiedMessages,
    groupedUnclassifiedMessages: messaging.groupedUnclassifiedMessages,
    isConnected: connection.isConnected,
    isConnecting: connection.isConnecting,
    isServerReachable: connectionMgr.isServerReachable,
    error: connection.error,
    inputUrl,
    setInputUrl,

    // Projects & Sessions
    projects: projects.projects,
    projectSessions: projects.projectSessions,
    selectedProject: projects.selectedProject,
    selectedSession: projects.selectedSession,
    isSessionBusy: false, // Placeholder

    // Models
    providers: models.providers,
    selectedModel: models.selectedModel,
    modelsLoading: models.loading,

    // Todos
    todos: todos.todos,
    todoDrawerExpanded: todos.expanded,
    setTodoDrawerExpanded: todos.setExpanded,

    // Actions
    connectToEvents,
    disconnectFromEvents,
    sendMessage,
    clearError,
    loadModels,
    onModelSelect,
    selectProject,
    selectSession,
    refreshSession,
    createSession,
    deleteSession: deleteSessionById
  };
};