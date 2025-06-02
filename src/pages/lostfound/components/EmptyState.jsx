// src/pages/lostfound/components/EmptyState.jsx

import React from "react";
// Assuming your global EmptyState component is at this path
import GlobalEmptyState from "./../../../components/UI/EmptyState.jsx"; // Adjust path as needed
// Icons that might be used for action buttons
import PlusCircleIcon from "./../../../components/icons/PlusCircleIcon.jsx"; // Adjust path as needed
import UserCircleIcon from "./../../../components/icons/UserCircleIcon.jsx"; // Adjust path as needed

const LostFoundEmptyState = ({
  currentStatus, // "lost" or "found"
  isItemsEmptyForStatus, // Boolean: true if no items exist in the DB for the currentStatus
  globalSearchTerm,
  activeFilters, // e.g., { category, sortBy } to know if local filters are active
  onOpenAddModal,
  onClearGlobalSearch,
  onClearLocalFilters,
  user, // Current authenticated user
  navigateToAuth, // Function to navigate to auth page
}) => {
  let icon = "search"; // Default icon
  let title = "No items found";
  let description = "Try adjusting your search or filter criteria.";
  let actionButton = null;

  const statusLabel = currentStatus === "lost" ? "lost" : "found"; // for messaging

  if (isItemsEmptyForStatus) {
    icon = currentStatus === "lost" ? "search" : "find_in_page"; // Or a more specific L&F icon
    title = `No ${statusLabel} items reported yet`;
    description = `Be the first to post about a ${statusLabel} item in your community!`;
    if (user) {
      actionButton = (
        <button
          onClick={onOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-1"
        >
          <PlusCircleIcon className="w-4 h-4" />
          <span>Post {statusLabel === "lost" ? "Lost" : "Found"} Item</span>
        </button>
      );
    } else {
      actionButton = (
        <button
          onClick={() => navigateToAuth("login")}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-1"
        >
          <UserCircleIcon className="w-4 h-4" />
          <span>Login to Post</span>
        </button>
      );
    }
  } else if (
    globalSearchTerm &&
    (!activeFilters ||
      (activeFilters.category === "" && activeFilters.sortBy === "newest"))
  ) {
    // Only global search term active, no significant local filters
    title = `No ${statusLabel} items found for "${globalSearchTerm}"`;
    description = "Try different keywords or check for typos.";
    if (onClearGlobalSearch) {
      actionButton = (
        <button
          onClick={onClearGlobalSearch}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Clear Search
        </button>
      );
    }
  } else if (
    activeFilters &&
    (activeFilters.category !== "" || activeFilters.sortBy !== "newest") &&
    !globalSearchTerm
  ) {
    // Only local filters active
    title = `No ${statusLabel} items match your filters`;
    description = "Try adjusting or clearing your filters to see more items.";
    if (onClearLocalFilters) {
      actionButton = (
        <button
          onClick={onClearLocalFilters}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Clear Filters
        </button>
      );
    }
  } else if (
    activeFilters &&
    (activeFilters.category !== "" || activeFilters.sortBy !== "newest") &&
    globalSearchTerm
  ) {
    // Both global search and local filters active
    title = `No ${statusLabel} items found for "${globalSearchTerm}" with current filters`;
    description = "Try simplifying your search or adjusting your filters.";
    if (onClearLocalFilters || onClearGlobalSearch) {
      actionButton = (
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {onClearGlobalSearch && (
            <button
              onClick={onClearGlobalSearch}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Clear Search
            </button>
          )}
          {onClearLocalFilters && (
            <button
              onClick={onClearLocalFilters}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Clear Filters
            </button>
          )}
        </div>
      );
    }
  }
  // Default "No items match" message is handled by initial values if no specific condition met

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 my-3">
      {" "}
      {/* Adjusted wrapper */}
      <GlobalEmptyState
        icon={icon}
        title={title}
        description={description}
        actionButton={actionButton}
        className="py-8" // Can adjust styling
      />
    </div>
  );
};

export default LostFoundEmptyState;
