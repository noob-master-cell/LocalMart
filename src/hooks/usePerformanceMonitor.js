// This custom React hook is designed for monitoring component render performance.
// It tracks the number of renders and the time taken for each render cycle.
// In development mode, it logs this information to the console.
// In production, it can be configured to report these timings to an analytics service (e.g., Google Analytics).

import { useEffect, useRef } from "react";

/**
 * `usePerformanceMonitor` hook.
 * Monitors and logs/reports render count and render time for a component.
 *
 * @param {string} componentName - The name of the component being monitored.
 * This is used for logging and analytics event naming.
 * @returns {number} The current render count of the component.
 */
export const usePerformanceMonitor = (componentName) => {
  // Ref to store the render count. `useRef` is used to persist this value across renders
  // without causing re-renders itself.
  const renderCount = useRef(0);
  // Ref to store the timestamp of the previous render's end, to calculate duration.
  const renderTimeRef = useRef();

  // useEffect with no dependency array runs after every render of the component.
  useEffect(() => {
    renderCount.current += 1; // Increment render count.

    // Calculate time taken for the current render.
    // `performance.now()` provides high-resolution timestamps.
    const now = performance.now();
    const renderTime = now - (renderTimeRef.current || now); // Use `now` if `renderTimeRef.current` is undefined (first render).
    renderTimeRef.current = now; // Update ref with the current timestamp for the next calculation.

    // Log performance data in development environment.
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Performance] ${componentName} - Render #${
          renderCount.current
        }: ${renderTime.toFixed(2)}ms`
      );
    }

    // Example: Report render timing to Google Analytics (gtag.js) in production.
    // This requires `gtag` to be initialized and available on the `window` object.
    if (process.env.NODE_ENV === "production" && window.gtag) {
      window.gtag("event", "timing_complete", {
        // Standard Google Analytics event for timing.
        name: `${componentName}_render`, // Event name, e.g., "MyComponent_render".
        value: Math.round(renderTime), // Event value (render time in milliseconds, rounded).
        // event_category: 'React Component Performance', // Optional: category for the event.
      });
    }
  }); // No dependency array: effect runs after every render.

  // Return the current render count. This can be used by the component if needed,
  // though typically this hook is used for its side effects (logging/reporting).
  return renderCount.current;
};
