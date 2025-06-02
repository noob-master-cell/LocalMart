// src/pages/buying/components/BuyingHeader.jsx

import React from "react";
// Import SearchIcon if you want to display it next to the search term
// import SearchIcon from '../../../../components/icons/SearchIcon.jsx'; // Adjust path as needed

const BuyingHeader = ({
  totalItemsCount, // Total items available before any filtering (from useBuyingData.allItems.length)
  processedItemsCount, // Items currently displayed after all filters (from useBuyingData.processedItems.length)
  globalSearchTerm,
  onClearSearchAndFilters, // Callback to clear global search and local filters
}) => {
  return (
    <div className="text-center mb-6 sm:mb-8">
      {" "}
      {/* Increased bottom margin */}
      {/* Main Title - Can be static or dynamic */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        Browse Items for Sale
      </h1>
      <p className="text-sm text-gray-500">
        Discover great deals from your local community.
      </p>
      {/* Search Status and Results Count */}
      <div className="mt-4">
        {globalSearchTerm && (
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-sm mb-2">
            {/* <SearchIcon className="w-4 h-4 text-blue-600" /> */}
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
            <button
              onClick={onClearSearchAndFilters} // This button now clears everything
              className="text-blue-600 hover:text-blue-800 ml-1"
              title="Clear search and filters"
            >
              &times; {/* Simple X for clear */}
            </button>
          </div>
        )}

        {totalItemsCount > 0 && ( // Only show counts if there are items in the database
          <p className="text-xs sm:text-sm text-gray-500">
            {processedItemsCount === 0 &&
            (globalSearchTerm || /* other active local filters */ true)
              ? "No items match your current criteria."
              : `Showing ${processedItemsCount} of ${totalItemsCount} available item(s)${
                  processedItemsCount !== totalItemsCount ? " (filtered)" : ""
                }`}
          </p>
        )}
      </div>
    </div>
  );
};

export default BuyingHeader;
