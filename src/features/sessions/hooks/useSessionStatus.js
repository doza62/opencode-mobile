import { useState, useEffect } from 'react';

/**
 * Hook to manage session status logic shared across visualizations
 * @returns {Object} Session status props and handlers
 */
const useSessionStatus = () => {
  const [isThinking, setIsThinking] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  // Simulate status updates (can be connected to real session events)
  useEffect(() => {
    // Placeholder for session status logic
  }, []);

  const setThinking = (thinking) => setIsThinking(thinking);
  const setBusy = (busy) => setIsBusy(busy);

  return {
    isThinking,
    isBusy,
    setThinking,
    setBusy,
  };
};

export default useSessionStatus;