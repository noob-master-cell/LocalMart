// This component renders an empty state message for the Lost & Found section.
// It provides contextual messages based on whether there are no items for the current status (lost/found),
// or if active search/filter criteria yield no results.
// It also includes relevant action buttons like "Post Item", "Login", or "Clear Filters".

import React from "react";
// GlobalEmptyState is a reusable component for various empty state scenarios.
import GlobalEmptyState from "./../../../components/UI/EmptyState.jsx";
// Icons for action buttons.
import PlusCircleIcon from "./../../../components/icons/PlusCircleIcon.jsx";
import UserCircleIcon from "./../../../components/icons/UserCircleIcon.jsx";

/**
 * LostFoundEmptyState component.
 *
 * @param {object} props - The component's props.
 * @param {string} props.currentStatus - The current active status ("lost" or "found").
 * @param {boolean} props.isItemsEmptyForStatus - True if no items exist in the database for the currentStatus.
 * @param {string} props.globalSearchTerm - The current global search term.
 * @param {object} props.activeFilters - Object containing active local filters (e.g., { category, sortBy }).
 * @param {Function} props.onOpenAddModal - Callback to open the modal for adding a new L&F item.
 * @param {Function} props.onClearGlobalSearch - Callback to clear the global search term.
 * @param {Function} props.onClearLocalFilters - Callback to clear local filters.
 * @param {object|null} props.user - The current authenticated user.
 * @param {Function} props.navigateToAuth - Function to navigate to the authentication page.
 */
const LostFoundEmptyState = ({
  currentStatus,
  isItemsEmptyForStatus,
  globalSearchTerm,
  activeFilters,
  onOpenAddModal,
  onClearGlobalSearch,
  onClearLocalFilters,
  user,
  navigateToAuth,
}) => {
  let icon = "search"; // Default icon.
  let title = "No items found";
  let description = "Try adjusting your search or filter criteria.";
  let actionButton = null; // Placeholder for the action button.

  // Label for messaging (e.g., "lost item", "found item").
  const statusLabel = currentStatus === "lost" ? "lost" : "found";

  // Scenario 1: No items exist in the database for the current status (lost/found).
  if (isItemsEmptyForStatus) {
    icon = currentStatus === "lost" ? "search" : "find_in_page"; // Icon specific to lost or found.
    title = `No ${statusLabel} items reported yet`;
    description = `Be the first to post about a ${statusLabel} item in your community!`;
    if (user) {
      // If user is logged in, show "Post Item" button.
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
      // If user is not logged in, show "Login to Post" button.
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
  }
  // Scenario 2: Global search is active, and no significant local filters are applied, yielding no results.
  else if (
    globalSearchTerm &&
    (!activeFilters ||
      (activeFilters.category === "" && activeFilters.sortBy === "newest"))
  ) {
    title = `No ${statusLabel} items found for "${globalSearchTerm}"`;
    description = "Try different keywords or check for typos.";
    if (onClearGlobalSearch) {
      // Provide a button to clear the search.
      actionButton = (
        <button
          onClick={onClearGlobalSearch}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Clear Search
        </button>
      );
    }
  }
  // Scenario 3: Local filters are active (but no global search), yielding no results.
  else if (
    activeFilters &&
    (activeFilters.category !== "" || activeFilters.sortBy !== "newest") &&
    !globalSearchTerm
  ) {
    title = `No ${statusLabel} items match your filters`;
    description = "Try adjusting or clearing your filters to see more items.";
    if (onClearLocalFilters) {
      // Provide a button to clear local filters.
      actionButton = (
        <button
          onClick={onClearLocalFilters}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Clear Filters
        </button>
      );
    }
  }
  // Scenario 4: Both global search and local filters are active, yielding no results.
  else if (
    activeFilters &&
    (activeFilters.category !== "" || activeFilters.sortBy !== "newest") &&
    globalSearchTerm
  ) {
    title = `No ${statusLabel} items found for "${globalSearchTerm}" with current filters`;
    description = "Try simplifying your search or adjusting your filters.";
    // Provide buttons to clear either search, filters, or both.
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
  // Default "No items match" message (covered by initial values) if specific conditions aren't met
  // but there are items in the DB for the current status.

  return (
    // Wrapper for styling the empty state container.
    <div className="bg-white rounded-lg shadow-sm p-4 my-3">
      <GlobalEmptyState
        icon={icon}
        title={title}
        description={description}
        actionButton={actionButton}
        className="py-8" // Padding for the inner content of GlobalEmptyState.
      />
    </div>
  );
};

export default LostFoundEmptyState;
