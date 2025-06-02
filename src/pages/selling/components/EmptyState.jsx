// This component renders an empty state message for the "Your Items for Sale" page.
// It displays different messages and actions based on whether the user has any items listed
// or if the current search/filter criteria yield no results.

import React from "react";
// GlobalEmptyState is a reusable component for displaying various empty state messages.
import GlobalEmptyState from "./../../../components/UI/EmptyState.jsx";
// Icon for the "List Your First Item" button.
import PlusCircleIcon from "./../../../components/icons/PlusCircleIcon.jsx";

/**
 * SellingEmptyState component.
 *
 * @param {object} props - The component's props.
 * @param {boolean} props.isUserItemsEmpty - True if the user has no items listed at all.
 * @param {string} props.globalSearchTerm - The current global search term, if any.
 * @param {Function} props.onOpenAddModal - Function to open the modal to add a new item.
 * @param {object} [props.activeFilters] - Optional: Active local filters, if needed for more specific messages.
 */
const SellingEmptyState = ({
  isUserItemsEmpty,
  globalSearchTerm,
  onOpenAddModal,
  // activeFilters, // This prop is available if more granular messages are needed.
}) => {
  let icon = "search"; // Default icon for "no results".
  let title = "No items found";
  let description =
    "No items match your current filters. Try adjusting your search criteria.";
  let actionButton = null; // Placeholder for an action button.

  // Scenario 1: The user has no items listed at all.
  if (isUserItemsEmpty) {
    icon = "shopping"; // Icon suggesting shopping or adding items.
    title = "No items listed yet";
    description =
      "Start selling by listing your first item. It's quick and easy!";
    // Action button to prompt the user to list their first item.
    actionButton = (
      <button
        onClick={onOpenAddModal}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
      >
        <PlusCircleIcon />
        <span>List Your First Item</span>
      </button>
    );
  }
  // Scenario 2: The user has items, but none match the current global search term.
  // (Local filters might also be active, but global search takes precedence in this message).
  else if (globalSearchTerm) {
    icon = "search";
    title = "No items found for your search";
    description = `No items match "${globalSearchTerm}". Try different keywords or adjust your filters.`;
    // Optionally, a "Clear Search" or "Clear Filters" button could be added here.
  }
  // Scenario 3 (Implicit): User has items, no global search, but local filters yield no results.
  // The default title and description cover this case.

  return (
    // Wrapper div for margin or other layout adjustments.
    <div className="mt-8">
      <GlobalEmptyState
        icon={icon}
        title={title}
        description={description}
        actionButton={actionButton} // Pass the conditionally defined action button.
        className="py-16" // Add padding to the empty state display.
      />
    </div>
  );
};

export default SellingEmptyState;
