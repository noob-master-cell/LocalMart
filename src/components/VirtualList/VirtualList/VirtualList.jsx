// project/src/components/VirtualList/VirtualList/VirtualList.jsx
import React, { useState, useEffect, useRef, useCallback, memo } from "react";

const VirtualList = memo(
  ({
    items,
    itemHeight,
    containerHeight,
    renderItem, // This prop is key for rendering item content
    overscan = 3,
    className = "",
    onLoadMore,
    hasMore = false,
    isLoading = false,
    loadingComponent,
    emptyComponent,
    scrollingStateText = "Scrolling...",
    // bufferSize = 5, // bufferSize was defined but not used in the provided code.
  }) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollElementRef = useRef(null);
    const scrollTimeout = useRef(null);
    const lastScrollTime = useRef(Date.now());

    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(
      items.length - 1, // Corrected to items.length - 1
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan // Removed -1, overscan handles buffer
    );

    const visibleItems = items.slice(startIndex, endIndex + 1);
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    const handleScroll = useCallback(
      (e) => {
        const currentScrollTop = e.target.scrollTop;
        const currentTime = Date.now();
        const timeDiff = currentTime - lastScrollTime.current;

        setScrollTop(currentScrollTop);

        const scrollSpeed =
          Math.abs(currentScrollTop - scrollTop) / (timeDiff || 1); // Avoid division by zero
        const isFastScrolling = scrollSpeed > 2;

        if (!isScrolling || isFastScrolling) {
          setIsScrolling(true);
        }

        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }

        scrollTimeout.current = setTimeout(() => {
          setIsScrolling(false);
        }, 150);

        lastScrollTime.current = currentTime;

        const scrollHeight = e.target.scrollHeight;
        const clientHeight = e.target.clientHeight;
        // Ensure scrollHeight is not zero to prevent NaN or Infinity
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
      ] // Added itemHeight & containerHeight as they affect calculations implicitly
    );

    useEffect(() => {
      return () => {
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
      };
    }, []);

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
        {isScrolling && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full z-10">
            {scrollingStateText}
          </div>
        )}
        <div
          ref={scrollElementRef}
          className="overflow-auto"
          style={{ height: containerHeight }}
          onScroll={handleScroll}
        >
          <div style={{ height: totalHeight, position: "relative" }}>
            <div
              style={{
                transform: `translateY(${offsetY}px)`,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              {visibleItems.map((item, index) => (
                // The key should be stable, item.id is preferred
                <div
                  key={item.id || `virtual-item-${startIndex + index}`}
                  style={{ height: itemHeight }}
                  className={isScrolling ? "pointer-events-none" : ""}
                >
                  {renderItem(item, startIndex + index, isScrolling)}
                </div>
              ))}
            </div>
            {isLoading && (
              <div
                style={{
                  position: "absolute",
                  // Position loading at the bottom of the currently rendered content, or full height if few items
                  bottom: Math.max(
                    0,
                    totalHeight -
                      (offsetY + (endIndex - startIndex + 1) * itemHeight) -
                      itemHeight
                  ),
                  left: 0,
                  right: 0,
                  height: itemHeight, // Height of one item for the loader
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
        {scrollTop > containerHeight && ( // Show scroll to top if scrolled more than one container height
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
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18" // Corrected path for arrow up
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
VirtualList.displayName = "VirtualList";

export const VirtualGrid = memo(
  // Exporting VirtualGrid as named export
  ({
    items,
    itemHeight, // Height of an individual item card
    itemsPerRow,
    containerHeight,
    renderItem,
    gap = 16, // Gap between grid items
    className = "",
    onLoadMore,
    hasMore = false,
    isLoading = false,
    emptyComponent,
    // No isScrolling prop for VirtualGrid in original
  }) => {
    const [scrollTop, setScrollTop] = useState(0);
    const scrollElementRef = useRef(null);

    const rowHeight = itemHeight + gap; // Total height of a row including the gap below it
    const totalRows = Math.ceil(items.length / itemsPerRow);
    const totalHeight = totalRows * rowHeight - (totalRows > 0 ? gap : 0); // Adjust total height to remove last row's bottom gap

    // Calculate visible range (overscanning might be beneficial here too, not in original)
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight));
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight)
    );

    const startIndex = startRow * itemsPerRow;
    const endIndex = Math.min(items.length - 1, (endRow + 1) * itemsPerRow - 1);

    const visibleItems = items.slice(startIndex, endIndex + 1);
    const offsetY = startRow * rowHeight;

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
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
                gap: `${gap}px`,
                padding: `0 ${gap / 2}px`, // Optional: add padding to sides if gap is only between items
              }}
            >
              {visibleItems.map((item, index) => (
                // The key should be stable, item.id is preferred
                <div
                  key={item.id || `virtual-grid-item-${startIndex + index}`}
                  style={{ height: itemHeight }} // This div now represents the cell, item rendering is inside
                >
                  {renderItem(item, startIndex + index)}
                </div>
              ))}
            </div>
          </div>

          {isLoading && (
            <div
              style={{
                position: "absolute",
                bottom: 0, // Adjust if loading indicator needs to be after last row
                left: 0,
                right: 0,
                height: itemHeight, // Or a fixed height for loading indicator
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

export default VirtualList; // VirtualList is the default export
