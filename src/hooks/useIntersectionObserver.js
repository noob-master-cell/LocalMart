// This custom React hook simplifies the use of the Intersection Observer API.
// It allows a component to observe a target element and receive updates
// when the element's intersection with the viewport (or a specified root element) changes.

import { useEffect, useRef, useState } from "react";

/**
 * `useIntersectionObserver` hook.
 * Observes a target element and updates its intersection state.
 *
 * @param {object} [options={}] - Configuration options for the IntersectionObserver.
 * See MDN for IntersectionObserver options (e.g., `root`, `rootMargin`, `threshold`).
 * @returns {[React.RefObject, boolean]} A tuple containing:
 * `targetRef` (React.RefObject): A ref object to attach to the target DOM element.
 * `isIntersecting` (boolean): A state variable indicating whether the target element is currently intersecting.
 */
export const useIntersectionObserver = (options = {}) => {
  // State to store whether the target element is currently intersecting with the viewport/root.
  const [isIntersecting, setIsIntersecting] = useState(false);
  // Ref to hold the DOM element that will be observed.
  const targetRef = useRef(null);

  // useEffect to set up and clean up the IntersectionObserver.
  useEffect(() => {
    const target = targetRef.current; // Get the current DOM element from the ref.

    // If there's no target element, do nothing.
    if (!target) return;

    // Create a new IntersectionObserver instance.
    // The callback function receives an array of IntersectionObserverEntry objects.
    // We're interested in the first entry for our single target.
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update the `isIntersecting` state based on the entry's `isIntersecting` property.
        setIsIntersecting(entry.isIntersecting);
      },
      options // Pass the provided options to the observer.
    );

    // Start observing the target element.
    observer.observe(target);

    // Cleanup function: Stop observing the target element when the component unmounts
    // or when dependencies of the useEffect hook change.
    return () => {
      observer.unobserve(target);
    };
  }, [options]); // Re-run the effect if the `options` object changes.
  // Note: If `options` is an object literal passed directly,
  // this effect might run on every render. Consider memoizing `options`
  // in the parent component or stringifying it for the dependency array
  // if it causes performance issues. For simple, stable options, this is usually fine.

  // Return the ref (to be attached to the target element) and the `isIntersecting` state.
  return [targetRef, isIntersecting];
};
