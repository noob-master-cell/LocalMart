import React from "react";

/**
 * @component BuyingHeader
 * @description A more compact header for the "Browse Items for Sale" (Buying) page.
 * It displays a title, and optionally the item count and search term information in a more condensed way.
 *
 * @param {object} props - The component's props.
 * @param {number} props.totalItemsCount - Total number of items available in the marketplace (before any filtering).
 * @param {number} props.processedItemsCount - Number of items currently displayed (after all filters).
 * @param {string} props.globalSearchTerm - The current global search term active in the application.
 * @param {Function} props.onClearSearchAndFilters - Callback function to clear the global search term and local filters.
 */
const BuyingHeader = ({
  totalItemsCount,
  processedItemsCount,
  globalSearchTerm,
  onClearSearchAndFilters,
}) => {
  const showItemCounts = totalItemsCount > 0;
  const isFiltered =
    globalSearchTerm || processedItemsCount !== totalItemsCount;

  return (
    <div className="mb-4 sm:mb-6">
      {" "}
      {/* Reduced bottom margin */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {/* Main title - now less prominent margin */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Browse Items for Sale
        </h1>

        {/* Search term and item count - more condensed */}
        {(globalSearchTerm || showItemCounts) && (
          <div className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-1">
            {globalSearchTerm && (
              <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-md px-2 py-0.5">
                <svg // Search Icon
                  className="w-3 h-3 text-blue-500 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="text-blue-700">
                  Searching: <strong>"{globalSearchTerm}"</strong>
                </span>
                <button
                  onClick={onClearSearchAndFilters}
                  className="ml-1.5 text-blue-500 hover:text-blue-700"
                  title="Clear search and filters"
                >
                  &times; {/* Simple 'X' icon */}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(BuyingHeader);
