import { useState, useCallback } from 'react';

/**
 * Hook for managing async operations with loading states and error handling
 * @param {Function} asyncFunction - The async function to execute
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Callback for success
 * @param {Function} options.onError - Callback for error
 * @returns {Object} - Loading state, error, and execute function
 */
export const useAsyncOperation = (asyncFunction, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction(...args);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      options.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, options]);

  return { loading, error, execute };
};