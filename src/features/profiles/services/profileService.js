import { apiClient } from '@/shared/services/api/client';
import { logger } from '@/shared/services/logger';

const SCRIPT_PATH = '~/.config/opencode/scripts/swap-profile.sh';
const profileLogger = logger.tag('ProfileService');

async function executeShellCommand(serverUrl, sessionId, command, selectedProject) {
  try {
    const response = await apiClient.post(
      `${serverUrl}/session/${sessionId}/shell`,
      {
        agent: 'Sisyphus',
        command: `${SCRIPT_PATH} ${command}`,
      },
      {},
      selectedProject
    );

    const data = await apiClient.parseJSON(response);

    const outputPart = data.parts?.find(p => p.type === 'text');
    const output = outputPart?.text || '';

    return {
      success: true,
      output: output.trim(),
    };
  } catch (error) {
    profileLogger.error('Shell command failed', error);
    return {
      success: false,
      output: '',
      error: error.message,
    };
  }
}

export const profileService = {
  setConnection(serverUrl, sessionId, selectedProject = null) {
    this.serverUrl = serverUrl;
    this.sessionId = sessionId;
    this.selectedProject = selectedProject;
  },

  async getCurrentProfile() {
    if (!this.serverUrl || !this.sessionId) {
      profileLogger.warn('No connection set, cannot get current profile');
      return null;
    }

    try {
      const result = await executeShellCommand(this.serverUrl, this.sessionId, 'current', this.selectedProject);
      return result.output || null;
    } catch (error) {
      profileLogger.error('Failed to get current profile', error);
      return null;
    }
  },

  async toggleProfile() {
    if (!this.serverUrl || !this.sessionId) {
      return { success: false, error: 'No connection set' };
    }

    try {
      const result = await executeShellCommand(this.serverUrl, this.sessionId, 'toggle', this.selectedProject);
      return result;
    } catch (error) {
      profileLogger.error('Failed to toggle profile', error);
      return { success: false, error: error.message };
    }
  },

  async switchProfile(profileName) {
    if (!this.serverUrl || !this.sessionId) {
      return { success: false, error: 'No connection set' };
    }

    try {
      const result = await executeShellCommand(this.serverUrl, this.sessionId, `switch ${profileName}`, this.selectedProject);
      return result;
    } catch (error) {
      profileLogger.error('Failed to switch profile', error);
      return { success: false, error: error.message };
    }
  },

  async listProfiles() {
    if (!this.serverUrl || !this.sessionId) {
      return null;
    }

    try {
      const result = await executeShellCommand(this.serverUrl, this.sessionId, 'list', this.selectedProject);
      return result.output;
    } catch (error) {
      profileLogger.error('Failed to list profiles', error);
      return null;
    }
  },
};
