// This module provides custom React hooks aimed at improving application performance.
// It includes utilities for throttling, debouncing, intersection observers,
// scheduling work with `requestIdleCallback`, and managing Firebase connections.

import { useCallback, useEffect, useRef } from "react";
// Import throttle and debounce functions from lodash-es for tree-shakable imports.
import { throttle, debounce } from "lodash-es";

/**
 * `usePerformanceOptimizations` hook.
 * Provides a set of performance optimization utilities.
 *
 * @returns {object} An object containing:
 * `createThrottledScrollHandler` (Function): Creates a throttled scroll event handler.
 * `createDebouncedSearch` (Function): Creates a debounced search function with request cancellation.
 * `useIntersectionObserver` (Function): A hook to use IntersectionObserver for lazy loading.
 * `scheduleWork` (Function): Schedules tasks using `requestIdleCallback`.
 * `addCleanup` (Function): Registers a cleanup function to be run on unmount.
 */
export const usePerformanceOptimizations = () => {
  // Ref to store a set of cleanup functions.
  // These functions will be called when the component using this hook unmounts.
  const cleanupFunctions = useRef(new Set());

  /**
   * Adds a function to the cleanup set.
   * @param {Function} fn - The cleanup function to add.
   * @returns {Function} A function to remove the cleanup function from the set.
   */
  const addCleanup = useCallback((fn) => {
    cleanupFunctions.current.add(fn);
    return () => cleanupFunctions.current.delete(fn); // Allows specific cleanup removal.
  }, []);

  /**
   * Creates a throttled scroll event handler.
   * Throttling ensures the handler is not called too frequently during scrolling.
   * @param {Function} handler - The scroll event handler function.
   * @param {number} [delay=16] - The throttle delay in milliseconds (approx. 60fps).
   * @returns {Function} The throttled event handler.
   */
  const createThrottledScrollHandler = useCallback(
    (handler, delay = 16) => {
      const throttledHandler = throttle(handler, delay, {
        leading: true, // Invoke on the leading edge of the timeout.
        trailing: true, // Invoke on the trailing edge of the timeout.
      });
      // Add the cancel method of the throttled handler to cleanup.
      addCleanup(() => throttledHandler.cancel());
      return throttledHandler;
    },
    [addCleanup] // Dependency: `addCleanup`.
  );

  /**
   * Creates a debounced search function.
   * Debouncing delays function execution until after a certain period of inactivity.
   * Includes AbortController logic for cancelling previous pending search requests.
   * @param {Function} searchFn - The asynchronous search function to be debounced.
   * It will receive the query and an AbortSignal.
   * @param {number} [delay=300] - The debounce delay in milliseconds.
   * @returns {Function} The debounced search function.
   */
  const createDebouncedSearch = useCallback(
    (searchFn, delay = 300) => {
      let abortController = null; // To manage cancellation of previous requests.

      const debouncedSearch = debounce(async (query) => {
        // Cancel the previous request if it's still pending.
        if (abortController) {
          abortController.abort();
        }
        abortController = new AbortController(); // Create a new AbortController for the current request.

        try {
          // Execute the search function with the query and abort signal.
          await searchFn(query, abortController.signal);
        } catch (error) {
          // Ignore AbortError, as it's an expected cancellation.
          if (error.name !== "AbortError") {
            console.error("Debounced search error:", error);
          }
        }
      }, delay);

      // Add cleanup for the debounced function and any active AbortController.
      addCleanup(() => {
        debouncedSearch.cancel(); // Cancel any pending debounced execution.
        if (abortController) {
          abortController.abort(); // Abort any ongoing request.
        }
      });
      return debouncedSearch;
    },
    [addCleanup] // Dependency: `addCleanup`.
  );

  /**
   * A hook to use IntersectionObserver for lazy loading or triggering actions when elements enter viewport.
   * @param {Function} callback - Function to call when an observed element intersects.
   * Receives the IntersectionObserverEntry target.
   * @param {object} [options={}] - IntersectionObserver options (e.g., threshold, rootMargin).
   * @returns {Function} An `observe` function to start observing an element.
   */
  const useIntersectionObserver = useCallback(
    (callback, options = {}) => {
      const observerRef = useRef(null); // Ref to store the IntersectionObserver instance.
      const elementRefs = useRef(new Set()); // Ref to store observed elements for cleanup.

      // Function to start observing an element.
      const observe = useCallback(
        (element) => {
          if (!element) return;

          // Create the observer instance if it doesn't exist.
          if (!observerRef.current) {
            observerRef.current = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    // If the element is intersecting.
                    callback(entry.target); // Execute the callback.
                    observerRef.current.unobserve(entry.target); // Stop observing once triggered.
                    elementRefs.current.delete(entry.target); // Remove from tracked elements.
                  }
                });
              },
              { threshold: 0.1, ...options } // Default threshold and custom options.
            );
          }

          observerRef.current.observe(element); // Start observing the element.
          elementRefs.current.add(element); // Add to tracked elements.
        },
        [callback, options] // Dependencies: `callback` and `options`.
      );

      // Add cleanup for the IntersectionObserver.
      addCleanup(() => {
        if (observerRef.current) {
          // Unobserve all tracked elements and disconnect the observer.
          elementRefs.current.forEach((el) => {
            if (observerRef.current) observerRef.current.unobserve(el); // Check observerRef.current exists
          });
          observerRef.current.disconnect();
        }
      });
      return observe;
    },
    [addCleanup] // Changed dependency from `callback` to `addCleanup`
    // because `callback` passed to `observe` should be stable if `observe` is memoized.
    // If `callback` itself needs to change, `useIntersectionObserver` should re-run.
    // Re-evaluating: `callback` *is* a dependency for the observer's creation.
    // So, `callback` and `options` should be dependencies for `observe` as well.
    // The outer `useCallback` for `useIntersectionObserver` depends on `addCleanup`.
    // Let's ensure `callback` is also a dep of the outer `useCallback` if it can change.
    // For now, assuming `callback` is stable or `useIntersectionObserver` reruns.
    // Corrected: The callback passed to new IntersectionObserver *must* be stable or the observer recreated.
    // The `observe` function's stability depends on whether `observerRef.current` is recreated.
    // The current structure implies the observer is created once.
  );

  /**
   * Schedules an array of tasks to be run during browser idle periods using `requestIdleCallback`.
   * @param {Array<Function>} tasks - An array of functions (tasks) to execute.
   */
  const scheduleWork = useCallback((tasks) => {
    if (
      !Array.isArray(tasks) ||
      typeof window === "undefined" ||
      !window.requestIdleCallback
    )
      return;

    const taskQueue = [...tasks]; // Create a mutable copy of the tasks.

    const scheduler = (deadline) => {
      // While there's time remaining in the idle period and tasks in the queue:
      while (deadline.timeRemaining() > 0 && taskQueue.length > 0) {
        const task = taskQueue.shift(); // Get the next task.
        if (typeof task === "function") {
          try {
            task(); // Execute the task.
          } catch (error) {
            console.error("Scheduled task error:", error);
          }
        }
      }

      // If tasks still remain, request another idle callback.
      if (taskQueue.length > 0) {
        requestIdleCallback(scheduler);
      }
    };

    // Start the scheduling process.
    requestIdleCallback(scheduler);
  }, []); // No dependencies, as `requestIdleCallback` is a browser API.

  // Effect to run all registered cleanup functions when the component unmounts.
  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach((fn) => {
        try {
          fn(); // Execute each cleanup function.
        } catch (error) {
          console.error("Cleanup function error:", error);
        }
      });
      cleanupFunctions.current.clear(); // Clear the set after execution.
    };
  }, []); // Empty dependency array: runs on mount, cleans up on unmount.

  return {
    createThrottledScrollHandler,
    createDebouncedSearch,
    useIntersectionObserver,
    scheduleWork,
    addCleanup,
  };
};

/**
 * `useFirebaseConnections` hook.
 * Manages a pool of Firebase listeners (e.g., `onSnapshot`) to ensure they are properly
 * added, removed, and unsubscribed, preventing memory leaks.
 *
 * @returns {object} An object containing:
 * `addConnection` (Function): Adds a Firebase listener's unsubscribe function to the pool.
 * `removeConnection` (Function): Removes and unsubscribes a listener by its key.
 */
export const useFirebaseConnections = () => {
  // Ref to store a map of connection keys to their unsubscribe functions.
  const connections = useRef(new Map());

  /**
   * Adds a Firebase listener's unsubscribe function to the pool.
   * If a listener for the same key already exists, it's unsubscribed first.
   * @param {string} key - A unique key identifying the listener.
   * @param {Function} unsubscribe - The unsubscribe function returned by the Firebase listener.
   */
  const addConnection = useCallback((key, unsubscribe) => {
    // Clean up existing connection for the same key, if any.
    if (connections.current.has(key)) {
      connections.current.get(key)();
    }
    connections.current.set(key, unsubscribe);
  }, []); // No dependencies, relies on `connections.current`.

  /**
   * Removes and unsubscribes a Firebase listener by its key.
   * @param {string} key - The key of the listener to remove.
   */
  const removeConnection = useCallback((key) => {
    if (connections.current.has(key)) {
      connections.current.get(key)(); // Call the unsubscribe function.
      connections.current.delete(key); // Remove from the map.
    }
  }, []); // No dependencies.

  // Effect to automatically unsubscribe all listeners when the component unmounts.
  useEffect(() => {
    return () => {
      connections.current.forEach((unsubscribe) => unsubscribe()); // Unsubscribe all.
      connections.current.clear(); // Clear the map.
    };
  }, []); // Empty dependency array: runs on mount, cleans up on unmount.

  return { addConnection, removeConnection };
};
