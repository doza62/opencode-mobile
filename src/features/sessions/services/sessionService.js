import { apiClient } from '@/shared/services/api/client';
import { logger, MESSAGE_LIMITS } from '@/shared';

/**
 * @param {string} serverBaseUrl
 * @param {Object} selectedProject
 * @returns {Promise<import('@/shared/types/opencode.types.js').Session>}
 */
export const createSession = async (serverBaseUrl, selectedProject = null) => {
  try {
    const response = await apiClient.post(`${serverBaseUrl}/session`, null, {
      headers: { 'Accept': 'application/json' }
    }, selectedProject);

    const session = await apiClient.parseJSON(response);

    if (!session.id) {
      throw new Error('Invalid session response: missing session id');
    }

    return session;
  } catch (error) {
    logger.error('Session creation failed', error);
    throw error;
  }
};

/**
 * @param {string} messageText
 * @param {string} mode
 * @param {Object} selectedProject
 * @param {Object} selectedModel
 * @param {boolean} isAsync
 * @param {Object} session
 * @param {string} serverBaseUrl
 * @returns {Promise<import('@/shared/types/opencode.types.js').SessionMessageResponse|boolean>}
 */
export const sendMessageToSession = async (
  messageText,
  mode = 'build',
  selectedProject = null,
  selectedModel = null,
  isAsync = false,
  session = null,
  serverBaseUrl = null
) => {
  if (!session || !serverBaseUrl) {
    throw new Error('No active session. Please provide session and serverBaseUrl.');
  }

  if (!selectedProject) {
    throw new Error('No project selected for message');
  }

  if (!selectedProject.worktree && !selectedProject.directory) {
    throw new Error('Selected project missing worktree or directory path');
  }

  if (!session.id || typeof session.id !== 'string') {
    throw new Error(`Invalid session ID: ${session.id}`);
  }

  const endpoint = isAsync ? 'prompt_async' : 'message';
  const messageUrl = `${serverBaseUrl}/session/${session.id}/${endpoint}`;

  const messageBody = {
    agent: mode,
    parts: [{ type: 'text', text: messageText }]
  };

  if (selectedModel) {
    messageBody.model = {
      providerID: selectedModel.providerId,
      modelID: selectedModel.modelId
    };
  }

  logger.emoji('📤', `Sending ${isAsync ? 'async' : 'sync'} message`, {
    sessionId: session.id,
    projectPath: selectedProject?.worktree || selectedProject?.directory,
    messageUrl,
  });

  try {
    const response = await apiClient.post(messageUrl, messageBody, {}, selectedProject);

    if (isAsync) {
      logger.emoji('✅', 'Async message sent successfully');
      return true;
    } else {
      const data = await apiClient.parseJSON(response);
      logger.emoji('✅', 'Message sent successfully', data);
      return data;
    }
  } catch (error) {
    logger.error('Message send failed', error);
    throw error;
  }
};

export const deleteSession = async (sessionId, serverBaseUrl, selectedProject = null) => {
  try {
    await apiClient.delete(`${serverBaseUrl}/session/${sessionId}`, {
      headers: { 'Accept': 'application/json' }
    }, selectedProject);

    logger.emoji('✅', 'Session deleted successfully', sessionId);
    return true;
  } catch (error) {
    logger.error('Session deletion failed', error);
    throw error;
  }
};

export const getSessionMessages = async (sessionId, serverBaseUrl, selectedProject = null, limit = MESSAGE_LIMITS.SESSION_MESSAGES) => {
  try {
    const response = await apiClient.get(`${serverBaseUrl}/session/${sessionId}/message?limit=${limit}`, {
      headers: { 'Accept': 'application/json' }
    }, selectedProject);

    const data = await apiClient.parseJSON(response);
    logger.emoji('📥', `Retrieved ${data?.length || 0} messages from session`, { sessionId, limit });
    return data || [];
  } catch (error) {
    logger.error('Failed to get session messages', error);
    throw error;
  }
};