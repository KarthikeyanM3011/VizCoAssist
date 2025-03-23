import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for polling an API endpoint at a specified interval
 * Useful for monitoring long-running processes like code analysis, diagram generation, etc.
 * 
 * @param {Function} pollingFunction - Async function to call on each poll
 * @param {number} interval - Polling interval in milliseconds
 * @param {boolean} immediate - Whether to call the function immediately
 * @param {boolean} enabled - Whether polling is enabled
 */
export const usePolling = (pollingFunction, interval = 3000, immediate = true, enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate && enabled);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(enabled);
  const [completion, setCompletion] = useState(0); // 0-100 progress value
  
  // Store the polling function in a ref so it can be updated without restarting the effect
  const pollingFunctionRef = useRef(pollingFunction);
  
  // Update the ref when the polling function changes
  useEffect(() => {
    pollingFunctionRef.current = pollingFunction;
  }, [pollingFunction]);
  
  // Function to execute a single poll
  const executePoll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await pollingFunctionRef.current();
      setData(result);
      
      // Check for completion or progress information
      if (result) {
        // Handle various API response formats
        if (result.progress !== undefined) {
          setCompletion(result.progress);
        } else if (result.status === 'completed' || result.complete) {
          setCompletion(100);
          setIsPolling(false);
        } else if (result.in_progress === false) {
          setCompletion(100);
          setIsPolling(false);
        }
      }
      
      setLoading(false);
      return result;
    } catch (err) {
      console.error('Polling error:', err);
      setError(err);
      setLoading(false);
      return null;
    }
  }, []);
  
  // Set up the polling interval
  useEffect(() => {
    let intervalId = null;
    
    // Immediate execution if requested
    if (immediate && enabled) {
      executePoll();
    }
    
    // Set up interval if polling is enabled
    if (enabled) {
      intervalId = setInterval(async () => {
        if (isPolling) {
          const result = await executePoll();
          
          // If polling is complete, clear the interval
          if (
            result && 
            (
              result.status === 'completed' || 
              result.complete || 
              result.in_progress === false
            )
          ) {
            clearInterval(intervalId);
          }
        }
      }, interval);
    }
    
    // Clean up on unmount or when enabled changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [enabled, immediate, interval, isPolling, executePoll]);
  
  // Start polling
  const startPolling = useCallback(() => {
    setIsPolling(true);
    executePoll(); // Execute immediately when starting
  }, [executePoll]);
  
  // Stop polling
  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);
  
  // Reset polling state
  const resetPolling = useCallback(() => {
    setData(null);
    setError(null);
    setCompletion(0);
    setIsPolling(enabled);
    if (enabled && immediate) {
      executePoll();
    }
  }, [enabled, immediate, executePoll]);
  
  return {
    data,
    loading,
    error,
    isPolling,
    completion,
    startPolling,
    stopPolling,
    resetPolling,
    executePoll
  };
};

export default usePolling;