import { useState, useEffect } from 'react';
import { useConnectionManager } from '@/features/connection/hooks/useConnectionManager';

/**
 * Hook to manage connection status logic shared across visualizations
 * @returns {Object} Connection status props and handlers
 */
const useConnectionStatus = () => {
  const { connection, isConnected, serverUrl, selectedProject, selectedSession, model } = useConnectionManager();
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading state for retries or updates (can be expanded)
  useEffect(() => {
    if (!isConnected) {
      setIsLoading(false);
    }
  }, [isConnected]);

  const onRetry = () => {
    setIsLoading(true);
    // Add retry logic here if needed, e.g., reconnect
    setTimeout(() => setIsLoading(false), 1000); // Placeholder
  };

  return {
    isConnected,
    serverUrl,
    selectedProject,
    selectedSession,
    model,
    isLoading,
    onRetry,
  };
};

export default useConnectionStatus;