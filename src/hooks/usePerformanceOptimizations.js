// src/hooks/usePerformanceOptimizations.js
import { useCallback, useEffect, useRef } from "react";
import { throttle, debounce } from "lodash-es";

export const usePerformanceOptimizations = () => {
  // Cleanup functions tracking
  const cleanupFunctions = useRef(new Set());

  const addCleanup = useCallback((fn) => {
    cleanupFunctions.current.add(fn);
    return () => cleanupFunctions.current.delete(fn);
  }, []);

  // Throttled scroll handler for virtual lists
  const createThrottledScrollHandler = useCallback(
    (handler, delay = 16) => {
      const throttledHandler = throttle(handler, delay, {
        leading: true,
        trailing: true,
      });

      // Add to cleanup
      addCleanup(() => throttledHandler.cancel());

      return throttledHandler;
    },
    [addCleanup]
  );

  // Debounced search with request cancellation
  const createDebouncedSearch = useCallback(
    (searchFn, delay = 300) => {
      let abortController = null;

      const debouncedSearch = debounce(async (query) => {
        // Cancel previous request
        if (abortController) {
          abortController.abort();
        }

        abortController = new AbortController();

        try {
          await searchFn(query, abortController.signal);
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Search error:", error);
          }
        }
      }, delay);

      // Add to cleanup
      addCleanup(() => {
        debouncedSearch.cancel();
        if (abortController) {
          abortController.abort();
        }
      });

      return debouncedSearch;
    },
    [addCleanup]
  );

  // Intersection observer for lazy loading
  const useIntersectionObserver = useCallback(
    (callback, options = {}) => {
      const observerRef = useRef(null);
      const elementRefs = useRef(new Set());

      const observe = useCallback(
        (element) => {
          if (!element) return;

          if (!observerRef.current) {
            observerRef.current = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    callback(entry.target);
                    observerRef.current.unobserve(entry.target);
                    elementRefs.current.delete(entry.target);
                  }
                });
              },
              { threshold: 0.1, ...options }
            );
          }

          observerRef.current.observe(element);
          elementRefs.current.add(element);
        },
        [callback]
      );

      // Cleanup observer
      addCleanup(() => {
        if (observerRef.current) {
          elementRefs.current.forEach((el) => {
            observerRef.current.unobserve(el);
          });
          observerRef.current.disconnect();
        }
      });

      return observe;
    },
    [callback, addCleanup]
  );

  // Request idle callback scheduler
  const scheduleWork = useCallback((tasks) => {
    if (!Array.isArray(tasks)) return;

    const taskQueue = [...tasks];

    const scheduler = (deadline) => {
      while (deadline.timeRemaining() > 0 && taskQueue.length > 0) {
        const task = taskQueue.shift();
        if (typeof task === "function") {
          try {
            task();
          } catch (error) {
            console.error("Scheduled task error:", error);
          }
        }
      }

      if (taskQueue.length > 0) {
        requestIdleCallback(scheduler);
      }
    };

    requestIdleCallback(scheduler);
  }, []);

  // Cleanup all functions on unmount
  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach((fn) => {
        try {
          fn();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      });
      cleanupFunctions.current.clear();
    };
  }, []);

  return {
    createThrottledScrollHandler,
    createDebouncedSearch,
    useIntersectionObserver,
    scheduleWork,
    addCleanup,
  };
};

// Hook for managing Firebase connections
export const useFirebaseConnections = () => {
  const connections = useRef(new Map());

  const addConnection = useCallback((key, unsubscribe) => {
    // Clean up existing connection
    if (connections.current.has(key)) {
      connections.current.get(key)();
    }
    connections.current.set(key, unsubscribe);
  }, []);

  const removeConnection = useCallback((key) => {
    if (connections.current.has(key)) {
      connections.current.get(key)();
      connections.current.delete(key);
    }
  }, []);

  // Auto cleanup on unmount
  useEffect(() => {
    return () => {
      connections.current.forEach((unsubscribe) => unsubscribe());
      connections.current.clear();
    };
  }, []);

  return { addConnection, removeConnection };
};
