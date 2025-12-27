// Project and session management
import { useState, useCallback } from 'react';
import { apiClient } from '@/services/api/client';

export const useProjectManager = (baseUrl) => {
  const [projects, setProjects] = useState([]);
  const [projectSessions, setProjectSessions] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load all projects
  const loadProjects = useCallback(async () => {
    if (!baseUrl) return;

    setLoading(true);
    try {
      const response = await apiClient.get(`${baseUrl}/project`);
      const data = await apiClient.parseJSON(response);
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Select a project and load its sessions
  const selectProject = useCallback(async (project) => {
    setSelectedProject(project);
    setSelectedSession(null); // Clear session selection

    if (project) {
      setLoading(true);
      try {
        const response = await apiClient.get(`${baseUrl}/session`);
        const allSessions = await apiClient.parseJSON(response);

        // Filter sessions for this project
        const projectSessions = allSessions.filter(
          session => session.projectID === project.id
        );
        setProjectSessions(projectSessions);
      } catch (error) {
        console.error('Failed to load project sessions:', error);
        setProjectSessions([]);
      } finally {
        setLoading(false);
      }
    } else {
      setProjectSessions([]);
    }
  }, [baseUrl]);

  // Select a session
  const selectSession = useCallback((session) => {
    setSelectedSession(session);
  }, []);

  // Create new session
  const createSession = useCallback(async () => {
    if (!selectedProject || !baseUrl) {
      throw new Error('No project selected');
    }

    try {
      const response = await apiClient.post(`${baseUrl}/session`, {});
      const newSession = await apiClient.parseJSON(response);

      // Add to project sessions
      setProjectSessions(prev => [newSession, ...prev]);
      setSelectedSession(newSession);

      return newSession;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }, [selectedProject, baseUrl]);

  // Delete session
  const deleteSession = useCallback(async (sessionId) => {
    if (!baseUrl) {
      throw new Error('No base URL available');
    }

    try {
      await apiClient.delete(`${baseUrl}/session/${sessionId}`);

      // Remove from project sessions
      setProjectSessions(prev => prev.filter(session => session.id !== sessionId));

      // Clear selection if deleted session was selected
      if (selectedSession && selectedSession.id === sessionId) {
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  }, [baseUrl, selectedSession]);

  return {
    projects,
    projectSessions,
    selectedProject,
    selectedSession,
    loading,
    loadProjects,
    selectProject,
    selectSession,
    createSession,
    deleteSession
  };
};