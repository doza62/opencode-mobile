import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/shared/services/api/client";
import { logger } from "@/shared/services/logger";

const apiLogger = logger.tag('API');

const FALLBACK_AGENTS = [
  { name: "build", color: null, model: null },
  { name: "plan", color: null, model: null },
];

export const useAgents = (baseUrl, selectedProject) => {
  const [agents, setAgents] = useState(FALLBACK_AGENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fetchAgents = useCallback(async () => {
    if (!baseUrl || !selectedProject) return;

    setLoading(true);
    try {
      const response = await apiClient.get(
        `${baseUrl}/agent`,
        {},
        selectedProject,
      );
      const data = await apiClient.parseJSON(response);
      const fetchedAgents = Array.isArray(data) ? data : [];
      const filteredAgents = fetchedAgents.filter(
        (agent) => agent.hidden !== true && agent.mode !== "subagent",
      );
      apiLogger.debug('Loaded agents', {
        total: fetchedAgents.length,
        filtered: filteredAgents.length,
        agents: filteredAgents.map(e => ({ name: e.name, mode: e.mode }))
      });
      setAgents(filteredAgents.length > 0 ? filteredAgents : FALLBACK_AGENTS);
      setSelectedIndex(0);
    } catch (err) {
      apiLogger.warn('Failed to fetch agents, using fallback', { error: err.message });
      setAgents(FALLBACK_AGENTS);
      setSelectedIndex(0);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, selectedProject]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const selectedAgent = agents[selectedIndex];
  const setSelectedAgent = (index) => setSelectedIndex(index);
  const cycleAgent = () =>
    setSelectedIndex((prev) => (prev + 1) % agents.length);

  return {
    agents,
    loading,
    error,
    selectedAgent,
    selectedIndex,
    setSelectedAgent,
    cycleAgent,
  };
};
