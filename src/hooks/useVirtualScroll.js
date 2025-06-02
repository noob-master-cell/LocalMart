// This custom React hook implements logic for virtual scrolling.
// Virtual scrolling is a technique to efficiently render long lists by only rendering
// the items currently visible in the viewport, plus a small buffer (overscan).
// This significantly improves performance for large datasets.

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * `useVirtualScroll` hook.
 *
 * @param {object} options - Configuration options for virtual scrolling.
 * @param {Array<any>} options.items - The full list of items to be virtualized.
 * @param {number} options.itemHeight - The fixed height of each item in the list (in pixels).
 * @param {number} options.containerHeight - The height of the scrollable container (in pixels).
 * @param {number} [options.overscan=3] - The number of items to render outside the visible viewport
 * (above and below) to reduce flickering during fast scrolling.
 * @param {number} [options.scrollingDelay=150] - The delay (in ms) after which scrolling is considered
 * to have stopped, used to toggle `isScrolling` state.
 * @returns {object} An object containing:
 * `visibleItems` (Array<any>): The subset of items that should be rendered.
 * `totalHeight` (number): The total scrollable height of the virtual list.
 * `offsetY` (number): The Y-offset for positioning the visible items wrapper.
 * `handleScroll` (Function): The scroll event handler to attach to the scrollable container.
 * `isScrolling` (boolean): A flag indicating if the list is currently being scrolled.
 * `startIndex` (number): The index of the first visible item.
 * `endIndex` (number): The index of the last visible item.
 */
export const useVirtualScroll = ({
  items,
  itemHeight,
  containerHeight,
  overscan = 3, // Number of items to render before and after the visible area.
  scrollingDelay = 150, // Delay in ms to determine if scrolling has stopped.
}) => {
  // State for the current scroll position (scrollTop) of the container.
  const [scrollTop, setScrollTop] = useState(0);
  // State to track if the user is actively scrolling.
  const [isScrolling, setIsScrolling] = useState(false);
  // Ref to store the timeout ID for the scrolling delay.
  const scrollTimeoutRef = useRef(null);

  // Calculate the start index of visible items, including overscan.
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  // Calculate the end index of visible items, including overscan.
  const endIndex = Math.min(
    items.length - 1, // Ensure endIndex does not exceed the last item's index.
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // Slice the `items` array to get only the items that should be currently rendered.
  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Calculate the total height the list would occupy if all items were rendered.
  const totalHeight = items.length * itemHeight;
  // Calculate the Y-offset to position the wrapper of visible items correctly within the scrollable area.
  const offsetY = startIndex * itemHeight;

  // Callback function to handle scroll events on the container.
  const handleScroll = useCallback(
    (e) => {
      const newScrollTop = e.target.scrollTop;
      setScrollTop(newScrollTop); // Update scroll position.
      setIsScrolling(true); // Set scrolling state to true.

      // Clear any existing timeout for detecting scroll stop.
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set a new timeout to change `isScrolling` to false after `scrollingDelay`.
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, scrollingDelay);
    },
    [scrollingDelay] // Dependency: `scrollingDelay`.
  );

  // Effect for cleaning up the scroll timeout when the component unmounts.
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount.

  // Return the necessary values and handlers for the component using this hook.
  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    isScrolling,
    startIndex,
    endIndex,
  };
};
