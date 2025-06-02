// This file implements VirtualList and VirtualGrid components for efficiently rendering
// large lists and grids of items by only rendering the items visible in the viewport.
import React, { useState, useEffect, useRef, useCallback, memo } from "react";

/**
 * VirtualList component for rendering long lists efficiently.
 * Only renders items currently visible in the viewport, plus an overscan buffer.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.items - The full list of items to render. Each item should have a stable `id` if possible.
 * @param {number} props.itemHeight - The fixed height of each item in pixels.
 * @param {number} props.containerHeight - The height of the scrollable container in pixels.
 * @param {Function} props.renderItem - Function to render each item: `(item, index, isScrolling) => JSX.Element`.
 * @param {number} [props.overscan=3] - Number of items to render above and below the visible area.
 * @param {string} [props.className=""] - Additional CSS classes for the outer container.
 * @param {Function} [props.onLoadMore] - Callback function to load more items when near the end of the list.
 * @param {boolean} [props.hasMore=false] - Indicates if there are more items to load.
 * @param {boolean} [props.isLoading=false] - Indicates if items are currently being loaded.
 * @param {React.ReactNode} [props.loadingComponent] - Custom component to display while loading more items.
 * @param {React.ReactNode} [props.emptyComponent] - Custom component to display when the list is empty.
 * @param {string} [props.scrollingStateText="Scrolling..."] - Text displayed when scrolling rapidly.
 * @returns {JSX.Element} The virtualized list.
 */
const VirtualList = memo(
  ({
    items,
    itemHeight,
    containerHeight,
    renderItem,
    overscan = 3, // Number of items to render outside the viewport for smoother scrolling.
    className = "",
    onLoadMore, // Callback to load more items.
    hasMore = false, // Flag indicating if more items can be loaded.
    isLoading = false, // Flag indicating if items are currently loading.
    loadingComponent, // Optional custom loading indicator.
    emptyComponent, // Optional custom component for empty list.
    scrollingStateText = "Scrolling...", // Text to show during fast scroll.
  }) => {
    const [scrollTop, setScrollTop] = useState(0); // Current scroll position from the top.
    const [isScrolling, setIsScrolling] = useState(false); // True if the user is actively scrolling.
    const scrollElementRef = useRef(null); // Ref for the scrollable div.
    const scrollTimeout = useRef(null); // Timeout ID for detecting end of scroll.
    const lastScrollTime = useRef(Date.now()); // Timestamp of the last scroll event.

    // Calculate the range of items to render based on scroll position and overscan.
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex + 1); // Items currently in the render window.
    const totalHeight = items.length * itemHeight; // Total scrollable height of the list.
    const offsetY = startIndex * itemHeight; // Vertical offset for positioning visible items.

    // Scroll event handler.
    const handleScroll = useCallback(
      (e) => {
        const currentScrollTop = e.target.scrollTop;
        const currentTime = Date.now();
        const timeDiff = currentTime - lastScrollTime.current;

        setScrollTop(currentScrollTop);

        // Detect fast scrolling to potentially optimize rendering (e.g., by showing placeholders).
        const scrollSpeed =
          Math.abs(currentScrollTop - scrollTop) / (timeDiff || 1);
        const isFastScrolling = scrollSpeed > 2; // Threshold for fast scrolling.

        if (!isScrolling || isFastScrolling) {
          setIsScrolling(true);
        }

        // Clear previous timeout and set a new one to detect when scrolling stops.
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
        scrollTimeout.current = setTimeout(() => {
          setIsScrolling(false);
        }, 150); // Delay to consider scrolling stopped.

        lastScrollTime.current = currentTime;

        // Trigger onLoadMore if near the bottom of the list.
        const scrollHeight = e.target.scrollHeight;
        const clientHeight = e.target.clientHeight;
        const scrollPercentage =
          scrollHeight > 0
            ? (currentScrollTop + clientHeight) / scrollHeight
            : 0;

        if (scrollPercentage > 0.8 && hasMore && !isLoading && onLoadMore) {
          onLoadMore();
        }
      },
      [
        scrollTop,
        isScrolling,
        hasMore,
        isLoading,
        onLoadMore,
        itemHeight,
        containerHeight,
      ]
    );

    // Cleanup scroll timeout on component unmount.
    useEffect(() => {
      return () => {
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
      };
    }, []);

    // Render empty state component if no items and not loading.
    if (items.length === 0 && !isLoading) {
      return (
        emptyComponent || (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No items to display
          </div>
        )
      );
    }

    return (
      <div className={`relative ${className}`}>
        {/* Display scrolling indicator during fast scrolls. */}
        {isScrolling && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full z-10">
            {scrollingStateText}
          </div>
        )}
        {/* Scrollable container. */}
        <div
          ref={scrollElementRef}
          className="overflow-auto" // Essential for scrolling.
          style={{ height: containerHeight }}
          onScroll={handleScroll}
        >
          {/* Inner div representing the total height of all items. */}
          <div style={{ height: totalHeight, position: "relative" }}>
            {/* Absolutely positioned div to hold the currently visible items. */}
            <div
              style={{
                transform: `translateY(${offsetY}px)`, // Shifts items into view.
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              {visibleItems.map((item, index) => (
                <div
                  // Use item.id for key if available, otherwise fallback to index.
                  key={item.id || `virtual-item-${startIndex + index}`}
                  style={{ height: itemHeight }}
                  // Disable pointer events during fast scrolling to improve performance.
                  className={isScrolling ? "pointer-events-none" : ""}
                >
                  {renderItem(item, startIndex + index, isScrolling)}
                </div>
              ))}
            </div>
            {/* Loading indicator at the bottom when loading more items. */}
            {isLoading && (
              <div
                style={{
                  position: "absolute",
                  bottom: Math.max(
                    0,
                    totalHeight -
                      (offsetY + (endIndex - startIndex + 1) * itemHeight) -
                      itemHeight
                  ),
                  left: 0,
                  right: 0,
                  height: itemHeight,
                }}
              >
                {loadingComponent || (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* "Scroll to Top" button, visible when scrolled down. */}
        {scrollTop > containerHeight && (
          <button
            onClick={() => {
              scrollElementRef.current?.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className="absolute bottom-4 right-4 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
            aria-label="Scroll to top"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
VirtualList.displayName = "VirtualList"; // For better debugging in React DevTools.

/**
 * VirtualGrid component for rendering items in a grid layout efficiently.
 * Similar to VirtualList but arranges items in rows and columns.
 */
export const VirtualGrid = memo(
  ({
    items,
    itemHeight, // Height of an individual item card.
    itemsPerRow, // Number of items per row in the grid.
    containerHeight,
    renderItem,
    gap = 16, // Gap (in pixels) between grid items.
    className = "",
    onLoadMore,
    hasMore = false,
    isLoading = false,
    emptyComponent,
  }) => {
    const [scrollTop, setScrollTop] = useState(0);
    const scrollElementRef = useRef(null);

    const rowHeight = itemHeight + gap; // Total height of a row including the gap.
    const totalRows = Math.ceil(items.length / itemsPerRow);
    // Adjust total height to remove the gap after the last row.
    const totalHeight = totalRows * rowHeight - (totalRows > 0 ? gap : 0);

    // Calculate the range of rows to render.
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight));
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight)
    );

    // Calculate the start and end indices of items within the visible rows.
    const startIndex = startRow * itemsPerRow;
    const endIndex = Math.min(items.length - 1, (endRow + 1) * itemsPerRow - 1);

    const visibleItems = items.slice(startIndex, endIndex + 1);
    const offsetY = startRow * rowHeight; // Vertical offset for the grid of visible items.

    const handleScroll = useCallback(
      (e) => {
        const currentScrollTop = e.target.scrollTop;
        setScrollTop(currentScrollTop);

        const scrollHeight = e.target.scrollHeight;
        const clientHeight = e.target.clientHeight;
        const scrollPercentage =
          scrollHeight > 0
            ? (currentScrollTop + clientHeight) / scrollHeight
            : 0;

        if (scrollPercentage > 0.8 && hasMore && !isLoading && onLoadMore) {
          onLoadMore();
        }
      },
      [hasMore, isLoading, onLoadMore]
    );

    if (items.length === 0 && !isLoading) {
      return (
        emptyComponent || (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No items to display
          </div>
        )
      );
    }

    return (
      <div
        ref={scrollElementRef}
        className={`overflow-auto ${className}`}
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {/* Container for the visible grid items, offset by `offsetY`. */}
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            {/* CSS Grid for arranging items. */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
                gap: `${gap}px`,
                // Optional padding if gap is only between items.
                padding: `0 ${gap / 2}px`,
              }}
            >
              {visibleItems.map((item, index) => (
                <div
                  key={item.id || `virtual-grid-item-${startIndex + index}`}
                  style={{ height: itemHeight }} // Each grid cell has the itemHeight.
                >
                  {renderItem(item, startIndex + index)}
                </div>
              ))}
            </div>
          </div>

          {/* Loading indicator at the bottom. */}
          {isLoading && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: itemHeight, // Or a fixed height for the loader.
              }}
              className="flex items-center justify-center"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          )}
        </div>
      </div>
    );
  }
);
VirtualGrid.displayName = "VirtualGrid";

export default VirtualList; // VirtualList is the default export.
