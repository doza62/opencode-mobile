// SSE orchestrator - combines all feature modules
import { useState, useCallback, useEffect, useRef } from 'react';

import { useSSEConnection } from './useSSEConnection';
import { useConnectionManager } from './useConnectionManager';
import { useAppState } from './useAppState';

import { useMessageProcessing, useEventManager } from '@/features/messaging';
import { useProjectManager } from '@/features/projects';
import { useModelManager } from '@/features/models';
import { useTodoManager } from '@/features/todos';
import { useNotificationManager } from '@/features/notifications';

import {
  sendMessageToSession,
  sendCommandToSession,
} from '@/features/sessions/services/sessionService';

import { generateMessageId } from '@/features/messaging/utils/messageIdGenerator';
import { storage } from '@/shared/services/storage';
import { useSessionStatus } from '@/features/sessions/hooks/useSessionStatus';
import { logger } from '@/shared/services/logger';

const sseLogger = logger.tag('SSE');
const connectionLogger = logger.tag('Connection');
const projectLogger = logger.tag('Project');
const sessionLogger = logger.tag('Session');
const deepLinkLogger = logger.tag('DeepLink');

export const useSSEOrchestrator = (initialUrl = 'http://10.1.1.122:63425') => {
  // Core state
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [baseUrl, setBaseUrl] = useState(null);
  const [currentAgentMode, setCurrentAgentMode] = useState('build');
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);
  const [shouldShowProjectSelector, setShouldShowProjectSelector] = useState(false);

  // Queue for deep links that arrive before projects are loaded
  const pendingDeepLinkRef = useRef(null);

  // Feature modules
  const projects = useProjectManager(baseUrl);

  // Heartbeat callback that only runs when a project is selected
  const heartbeatCallback = useCallback(() => {
    if (projects.selectedProject) {
      projects.refreshProjectSessions();
    }
  }, [projects]);

  // Connection with enhanced state machine
  const connection = useSSEConnection(baseUrl, {
    heartbeatCallback,
    onStateChange: (newState, oldState) => {
      connectionLogger.debug('Connection state changed', { from: oldState, to: newState });
    },
    onError: errorInfo => {
      connectionLogger.error('Connection error', errorInfo);
    },
  });

  const connectionMgr = useConnectionManager();

  // App lifecycle with reconnection support
  const appState = useAppState({
    onForeground: () => {
      connectionLogger.debug('App came to foreground');
      // Reconnect if disconnected but was previously connected
      if (baseUrl && connection.isDisconnected && !connection.isFailed) {
        connectionLogger.debug('Reconnecting on app foreground');
        connection.connect();
      }
    },
    onBackground: () => {
      connectionLogger.debug('App went to background');
    },
  });

  const messaging = useMessageProcessing();
  const models = useModelManager(baseUrl, projects.selectedProject);
  const todos = useTodoManager(baseUrl, projects.selectedSession?.id, projects.selectedProject);
  const sessionStatus = useSessionStatus(
    projects.selectedSession,
    baseUrl,
    projects.selectedProject,
    messaging,
  );

  const disconnectFromEvents = useCallback(() => {
    connection.disconnect();
    messaging.clearEvents();
    projects.selectProject(null);
    setBaseUrl(null);
    // Show project selector on disconnect so user can re-select
    setShouldShowProjectSelector(true);
  }, [connection, messaging, projects]);

  const connect = useCallback(
    async (url, options = {}) => {
      const { autoSelect = false, forceReconnect = false } = options;

      try {
        // Disconnect if forcing reconnect
        if (forceReconnect && connection.isConnected) {
          disconnectFromEvents();
        }

        // Validate and connect
        const cleanUrl = await connectionMgr.validateAndConnect(url);
        setBaseUrl(cleanUrl);
        setInputUrl(url);

        // Auto-select saved project/session if requested
        if (autoSelect) {
          try {
            const savedProject = await storage.get('lastSelectedProject');
            const savedSession = await storage.get('lastSelectedSession');

            if (savedProject) {
              projectLogger.debug('Auto-selecting saved project', { name: savedProject.name });
              await projects.selectProject(savedProject);

              if (savedSession) {
                sessionLogger.debug('Auto-selecting saved session', { title: savedSession.title });
                await projects.selectSession(savedSession);
              }
            } else {
              projectLogger.debug('No saved project to auto-select, showing project selector');
              setShouldShowProjectSelector(true);
            }
          } catch (error) {
            connectionLogger.error('Error during auto-selection', error);
          }
        }

        // Save successful connection URL
        await storage.set('lastConnectedUrl', url);
      } catch (error) {
        connectionLogger.error('Connection failed', error);
        throw error;
      }
    },
    [connectionMgr, projects, connection.isConnected, disconnectFromEvents],
  );

  const handleDeepLink = useCallback(
    async deepLinkData => {
      deepLinkLogger.debug('Processing deep link', {
        type: deepLinkData.type,
        hasProjects: !!projects.projects?.length,
        serverUrl: deepLinkData.serverUrl,
        projectPath: deepLinkData.projectPath,
        sessionId: deepLinkData.sessionId,
      });

      const { serverUrl, projectPath, sessionId } = deepLinkData;

      // Validate required deep link fields
      if (!serverUrl) {
        deepLinkLogger.warn('Deep link missing serverUrl');
        return;
      }

      const isDifferentServer = serverUrl && serverUrl !== baseUrl;

      // If connecting to different server, validate session exists first
      if (isDifferentServer && sessionId) {
        try {
          deepLinkLogger.debug('Validating session on new server', { serverUrl, sessionId });
          const cleanUrl = serverUrl.replace(/\/global\/event$/, '').replace(/\/$/, '');
          const testUrl = `${cleanUrl}/session/${sessionId}`;
          deepLinkLogger.debug('Session validation URL', {
            testUrl,
            isConnected: connection.isConnected,
            currentBaseUrl: baseUrl,
          });
          const response = await fetch(testUrl);
          deepLinkLogger.debug('Session validation response', {
            status: response.status,
            ok: response.ok,
          });
          if (!response.ok) {
            deepLinkLogger.warn('Session not found on new server', {
              status: response.status,
              sessionId,
            });
            return;
          }
          const sessionData = await response.json();
          deepLinkLogger.debug('Session validated', { exists: !!sessionData });
        } catch (error) {
          deepLinkLogger.error('Failed to validate session on new server', error);
          return;
        }
      }

      deepLinkLogger.debug('After validation, checking state', {
        isConnected: connection.isConnected,
        isDifferentServer,
        hasProjects: !!projects.projects?.length,
        baseUrl,
      });

      // If projects aren't loaded yet, queue deep link for later
      if (!projects.projects || projects.projects.length === 0) {
        deepLinkLogger.debug('Projects not loaded yet, queuing deep link');
        pendingDeepLinkRef.current = deepLinkData;
        return;
      }

      // Clear queued deep link since we're processing now
      pendingDeepLinkRef.current = null;

      if (!connection.isConnected) {
        try {
          await connect(serverUrl, { autoSelect: false });
        } catch (error) {
          connectionLogger.error('Deep link connection failed', error);
          return;
        }
      } else if (isDifferentServer) {
        try {
          disconnectFromEvents();
          await connect(serverUrl, { autoSelect: false });
        } catch (error) {
          connectionLogger.error('Deep link connection failed', error);
          return;
        }
      }

      if (projectPath) {
        const project = projects.projects.find(p => p.path === projectPath);
        if (project) {
          deepLinkLogger.debug('Found project from deep link', { path: projectPath });
          await projects.selectProject(project);
        } else {
          deepLinkLogger.debug('Project not found from deep link', {
            path: projectPath,
            availableProjects: projects.projects.map(p => p.path),
          });
        }
      }

      if (sessionId && projects.projectSessions) {
        const session = projects.projectSessions.find(s => s.id === sessionId);
        if (session) {
          projects.selectSession(session);
          if (baseUrl) {
            messaging.clearEvents();
            messaging.loadMessages(baseUrl, session.id, projects.selectedProject);
          }
        }
      }
    },
    [connection.isConnected, connect, projects, baseUrl, messaging],
  );

  const notifications = useNotificationManager({
    serverBaseUrl: baseUrl,
    onDeepLink: handleDeepLink,
    onUrlUpdate: async newUrl => {
      connectionLogger.info('URL update notification received', { newUrl });

      await storage.set('lastConnectedUrl', newUrl);
      setInputUrl(newUrl);
      setBaseUrl(null);
      disconnectFromEvents();

      try {
        await connect(newUrl, { autoSelect: false });
        connectionLogger.info('Reconnected to new URL from notification');
      } catch (error) {
        connectionLogger.error('Failed to reconnect to new URL', error);
      }
    },
  });

  // Debug: Log projects changes
  useEffect(() => {
    projectLogger.debug('Projects updated', { count: projects.projects?.length || 0 });
  }, [projects.projects]);

  // Process queued deep link when projects are loaded
  useEffect(() => {
    if (projects.projects && projects.projects.length > 0 && pendingDeepLinkRef.current) {
      deepLinkLogger.debug('Projects loaded, processing queued deep link');
      const queuedDeepLink = pendingDeepLinkRef.current;
      pendingDeepLinkRef.current = null;
      handleDeepLink(queuedDeepLink);
    }
  }, [projects.projects, handleDeepLink]);

  // Show embedded project selector when projects are loaded but no project is selected
  useEffect(() => {
    if (
      projects.projects &&
      projects.projects.length > 0 &&
      !projects.selectedProject &&
      connection.isConnected
    ) {
      projectLogger.debug('Projects loaded, showing embedded project selector');
      setShouldShowProjectSelector(true);
    }
  }, [projects.projects, projects.selectedProject, connection.isConnected]);

  useEffect(() => {
    const loadSavedUrl = async () => {
      try {
        const savedUrl = await storage.get('lastConnectedUrl');
        if (savedUrl) {
          setInputUrl(savedUrl);
        }
      } catch (error) {
        connectionLogger.error('Failed to load saved URL', error);
      }
    };
    loadSavedUrl();
  }, []);

  // Auto-connect on app start if we have a saved URL
  useEffect(() => {
    const autoConnect = async () => {
      try {
        const savedUrl = await storage.get('lastConnectedUrl');
        connectionLogger.debug('Checking for saved connection');

        if (savedUrl && inputUrl === savedUrl && !autoConnectAttempted) {
          connectionLogger.debug('Auto-connect attempt starting', { url: savedUrl });
          setAutoConnectAttempted(true);

          try {
            if (!connection.isConnected) {
              connectionLogger.debug('Establishing connection...');
              await connect(savedUrl, { autoSelect: false });
            } else {
              connectionLogger.debug('Already connected, loading projects...');
              await projects.loadProjects();

              const savedProject = await storage.get('lastSelectedProject');
              const savedSession = await storage.get('lastSelectedSession');

              if (savedProject) {
                projectLogger.debug('Auto-selecting saved project', { name: savedProject.name });
                await projects.selectProject(savedProject);
                projectLogger.debug('Project auto-selected');
              } else {
                projectLogger.debug('No saved project, triggering project selector');
                setShouldShowProjectSelector(true);
              }

              connectionLogger.debug('Auto-connect completed');
            }
          } catch (error) {
            connectionLogger.error('Auto-connect failed', error);
            setAutoConnectAttempted(false);
          }
        } else {
          connectionLogger.debug('Skipping auto-connect', {
            hasSavedUrl: !!savedUrl,
            urlMatches: inputUrl === savedUrl,
            alreadyAttempted: autoConnectAttempted,
            isConnected: connection.isConnected,
          });
        }
      } catch (error) {
        connectionLogger.error('Error during auto-connect check', error);
      }
    };

    const timeoutId = setTimeout(autoConnect, 500);
    return () => clearTimeout(timeoutId);
  }, [inputUrl, autoConnectAttempted, connection.isConnected, projects, connect]);

  // Event manager for SSE messages
  const eventManager = useEventManager(message => {
    sseLogger.debugCtx('SSE_FLOW', 'Received SSE message', { type: message.payload?.type });

    if (message.payload?.type === 'session.status' || message.payload?.type === 'session.idle') {
      sseLogger.debugCtx('SESSION_MANAGEMENT', 'Handling session status/idle');
      sessionStatus.handleSessionStatus(message);
    }

    const processedMessage = messaging.processMessage(message, currentAgentMode);

    if (processedMessage && !processedMessage.isPartial) {
      const rawAgent = processedMessage.rawData?.payload?.properties?.info?.agent;
      const hasAgent = !!rawAgent;

      if (processedMessage.role === 'user') {
        if (hasAgent) {
          sseLogger.debugCtx(
            'SSE_FLOW',
            'Skipping contradictory message (role=user but has agent)',
            {
              messageId: processedMessage.messageId,
              agent: rawAgent,
            },
          );
        } else {
          sseLogger.debugCtx('SSE_FLOW', 'Skipping user role message (already shown locally)', {
            messageId: processedMessage.messageId,
          });
        }
        return;
      }

      if (processedMessage.type === 'message_finalized' && !processedMessage.message) {
        sseLogger.debugCtx('SSE_FLOW', 'Skipping message without content (waiting for parts)', {
          messageId: processedMessage.messageId,
          hasParts: processedMessage.assembledFromParts,
        });
        return;
      }

      messaging.addEvent(processedMessage);
    }
  }, projects.selectedSession);

  const sendMessage = useCallback(
    async (messageText, agent = { name: 'build' }) => {
      if (!projects.selectedSession) {
        throw new Error('No session selected');
      }

      if (!connection.isConnected) {
        throw new Error('Not connected');
      }

      if (!messageText || !messageText.trim()) {
        throw new Error('Cannot send empty message');
      }

      const agentName = typeof agent === 'string' ? agent : agent.name;
      setCurrentAgentMode(agentName);

      if (typeof agent === 'object' && agent.model) {
        await models.selectModel(agent.model.providerID, agent.model.modelID);
      }

      const sentMessageId = generateMessageId();
      messaging.addEvent({
        id: sentMessageId,
        type: 'sent',
        category: 'sent',
        message: messageText,
        projectName: 'Me',
        icon: 'User',
        timestamp: new Date().toISOString(),
        mode: agentName,
        sessionId: projects.selectedSession?.id,
      });

      try {
        const response = await sendMessageToSession(
          messageText,
          agentName,
          projects.selectedProject,
          models.selectedModel,
          true,
          projects.selectedSession,
          baseUrl,
        );

        todos.setExpanded(false);

        return response;
      } catch (error) {
        connectionLogger.error('Message send failed', error);
        messaging.removeEvent(sentMessageId);
        throw error;
      }
    },
    [
      connection.isConnected,
      messaging,
      projects.selectedProject,
      projects.selectedSession,
      models,
      todos,
      baseUrl,
    ],
  );

  // Send command
  const sendCommand = useCallback(
    async commandText => {
      if (!projects.selectedSession) {
        throw new Error('No session selected');
      }

      if (!connection.isConnected) {
        throw new Error('Not connected');
      }

      if (!commandText || !commandText.trim()) {
        throw new Error('Cannot send empty command');
      }

      // Parse command name and arguments from "/command arg1 arg2"
      const trimmedCommand = commandText.trim();
      const parts = trimmedCommand.split(/\s+/);
      const commandName = parts[0].startsWith('/') ? parts[0].slice(1) : parts[0];
      const args = parts.slice(1);

      const sentMessageId = generateMessageId();
      messaging.addEvent({
        id: sentMessageId,
        type: 'sent',
        category: 'sent',
        message: commandText,
        projectName: 'Me',
        icon: 'User',
        timestamp: new Date().toISOString(),
        mode: currentAgentMode,
        sessionId: projects.selectedSession?.id,
      });

      try {
        const response = await sendCommandToSession(
          commandName,
          projects.selectedProject,
          projects.selectedSession,
          baseUrl,
          args,
        );

        return response;
      } catch (error) {
        connectionLogger.error('Command send failed', error);
        messaging.removeEvent(sentMessageId);
        throw error;
      }
    },
    [
      connection.isConnected,
      messaging,
      projects.selectedProject,
      projects.selectedSession,
      baseUrl,
    ],
  );

  // Clear error
  const clearError = useCallback(() => {
    connection.clearError();
  }, [connection]);

  // Load models
  const loadModels = useCallback(async () => {
    await models.loadModels();
  }, [models]);

  // Select model
  const onModelSelect = useCallback(
    async (providerId, modelId) => {
      await models.selectModel(providerId, modelId);
    },
    [models],
  );

  // Session management
  const selectProject = useCallback(
    async project => {
      await projects.selectProject(project);
    },
    [projects],
  );

  const selectSession = useCallback(
    async session => {
      sessionLogger.debug('Selecting session', { title: session?.title });
      await projects.selectSession(session);
      sessionLogger.debug('Session selected', { title: projects.selectedSession?.title });
      // Clear previous messages and load new session messages
      if (session && baseUrl) {
        messaging.clearEvents();
        messaging.loadMessages(baseUrl, session.id, projects.selectedProject);
      } else {
        // Clear events if no session selected
        messaging.clearEvents();
      }
    },
    [projects, messaging, baseUrl],
  );

  const createSession = useCallback(async () => {
    return await projects.createSession();
  }, [projects]);

  const deleteSessionById = useCallback(
    async sessionId => {
      await projects.deleteSession(sessionId);
    },
    [projects],
  );

  const refreshSession = useCallback(() => {
    if (projects.selectedSession && baseUrl) {
      // Clear events before refreshing to avoid duplicates
      messaging.clearEvents();
      messaging.loadMessages(baseUrl, projects.selectedSession.id, projects.selectedProject);
      todos.loadTodos();
    }
  }, [projects.selectedSession, baseUrl, messaging, todos, projects.selectedProject]);

  // Clear debug messages
  const clearDebugMessages = useCallback(() => {
    messaging.clearEvents();
  }, [messaging]);

  // Load older messages callback
  const loadOlderMessages = useCallback(
    async beforeMessageId => {
      // Check buffer first
      if (messaging.hasOlderMessagesBuffer) {
        messaging.consumeFromBuffer();
        return [];
      }

      if (!baseUrl || !projects.selectedSession?.id) {
        return [];
      }
      const olderMessages = await messaging.loadOlderMessages(
        baseUrl,
        projects.selectedSession.id,
        projects.selectedProject,
        beforeMessageId,
      );
      if (olderMessages && olderMessages.length > 0) {
        messaging.prependOlderMessages(olderMessages);
      }
      return olderMessages;
    },
    [baseUrl, projects.selectedSession, projects.selectedProject, messaging],
  );

  // Return unified interface (backward compatible)
  return {
    // Connection state
    events: messaging.events,
    unclassifiedMessages: messaging.unclassifiedMessages,
    groupedUnclassifiedMessages: messaging.groupedUnclassifiedMessages,
    allMessages: messaging.allMessages,
    groupedAllMessages: messaging.groupedAllMessages,
    isConnected: connection.isConnected,
    isConnecting: connection.isConnecting,
    isReconnecting: connection.isReconnecting,
    isFailed: connection.isFailed,
    isDisconnected: connection.isDisconnected,
    connectionState: connection.state,
    connectionError: connection.error,
    connectionErrorType: connection.errorType,
    connectionRetryCount: connection.retryCount,
    connectionMaxRetries: connection.maxRetries,
    isServerReachable: connectionMgr.isServerReachable,
    error: connection.error,
    inputUrl,
    setInputUrl,
    baseUrl,

    // Projects & Sessions
    projects: projects.projects,
    projectSessions: projects.projectSessions,
    sessionStatuses: projects.sessionStatuses,
    selectedProject: projects.selectedProject,
    selectedSession: projects.selectedSession,
    sessionLoading: projects.sessionLoading,
    isSessionBusy: sessionStatus.isThinking,

    // Models
    providers: models.providers,
    selectedModel: models.selectedModel,
    modelsLoading: models.loading,

    // Todos
    todos: todos.todos,
    todoDrawerExpanded: todos.expanded,
    setTodoDrawerExpanded: todos.setExpanded,

    // UI State
    shouldShowProjectSelector,

    // Actions
    connect,
    disconnectFromEvents,
    reconnect: connection.reconnect,
    sendMessage,
    sendCommand,
    clearError,
    loadModels,
    onModelSelect,
    selectProject,
    selectSession,
    refreshSession,
    createSession,
    deleteSession: deleteSessionById,
    clearDebugMessages,
    sendTestNotification: notifications.sendTestNotification,
    loadOlderMessages,
  };
};
