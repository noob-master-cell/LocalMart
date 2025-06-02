// This component renders the header for the "Browse Items for Sale" (Buying) page.
// It displays a title, a subtitle, the count of available items,
// and information about any active global search term, including an option to clear it.

import React from "react";
// Icon for displaying next to the search term (optional).
// import SearchIcon from '../../../../components/icons/SearchIcon.jsx';

/**
 * BuyingHeader component.
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
  return (
    // Centered text alignment for the header content.
    <div className="text-center mb-6 sm:mb-8">
      {/* Main title and subtitle for the buying section. */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        Browse Items for Sale
      </h1>
      <p className="text-sm text-gray-500">
        Discover great deals from your local community.
      </p>

      {/* Section to display search status and results count. */}
      <div className="mt-4">
        {/* Display the current global search term if it's active. */}
        {globalSearchTerm && (
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-sm mb-2">
            {/* Search Icon (inline SVG example) */}
            <svg
              className="w-4 h-4 text-blue-600"
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
            <span className="text-blue-800">
              Searching for: <strong>"{globalSearchTerm}"</strong>
            </span>
            {/* Button to clear the global search term and associated filters. */}
            <button
              onClick={onClearSearchAndFilters}
              className="text-blue-600 hover:text-blue-800 ml-1"
              title="Clear search and filters"
            >
              &times; {/* Simple 'X' icon for clearing. */}
            </button>
          </div>
        )}

        {/* Display item counts only if there are items in the database. */}
        {totalItemsCount > 0 && (
          <p className="text-xs sm:text-sm text-gray-500">
            {processedItemsCount === 0 && // If no items match criteria
            (globalSearchTerm ||
              /* Check if other local filters are active, simplified here */ true)
              ? "No items match your current criteria."
              : `Showing ${processedItemsCount} of ${totalItemsCount} available item(s)${
                  // Indicate if the list is filtered.
                  processedItemsCount !== totalItemsCount ? " (filtered)" : ""
                }`}
          </p>
        )}
      </div>
    </div>
  );
};

export default BuyingHeader;
