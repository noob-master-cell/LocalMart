// This component renders an empty state message specifically for the "Buying" section.
// It handles various scenarios:
// 1. No items available in the entire marketplace.
// 2. Global search yields no results.
// 3. Local filters yield no results.
// It can also suggest actions like "List Your First Item" or "Clear Filters".

import React from "react";
// Icons for action buttons.
import PlusCircleIcon from "../../../components/icons/PlusCircleIcon.jsx";
import UserCircleIcon from "../../../components/Icons/UserCircleIcon.jsx";
// The GlobalEmptyState component is expected to be imported by the parent (BuyingSection)
// and this component would be passed as children or configured via props.
// For this structure, we assume this component directly uses UI elements or a specific
// local empty state structure if `GlobalEmptyState` isn't flexible enough.
// However, the original prompt structure implies this component defines its own content
// and might not use a separate `GlobalEmptyState` directly. We'll follow that.

/**
 * BuyingEmptyState component.
 *
 * @param {object} props - The component's props.
 * @param {boolean} props.areAnyItemsAvailable - True if there are items in the database,
 * false if the `sell_items` collection is empty.
 * @param {string} props.globalSearchTerm - The current global search term.
 * @param {object} props.activeFilters - Object containing active local filters
 * (e.g., { category, sortBy, priceRange }).
 * @param {Function} props.onClearSearchAndFilters - Function to clear global search and local filters.
 * @param {object|null} props.user - The current authenticated user (to suggest selling if logged in).
 * @param {Function} [props.navigateToSell] - Optional: function to navigate to the selling page.
 * @param {Function} [props.navigateToAuth] - Optional: function to navigate to the auth page.
 */
const BuyingEmptyState = ({
  areAnyItemsAvailable,
  globalSearchTerm,
  activeFilters,
  onClearSearchAndFilters,
  user,
  navigateToSell,
  navigateToAuth,
}) => {
  let iconType = "search"; // Default icon.
  let title = "No items match your criteria";
  let description =
    "Try adjusting your search or filter settings, or check back later for new listings.";
  let actionButton = null;

  // Scenario 1: The entire marketplace is empty.
  if (!areAnyItemsAvailable) {
    iconType = "shopping"; // Icon suggesting an empty shop.
    title = "The marketplace is empty right now!";
    description =
      "No items have been listed for sale yet. Why not be the first to sell something?";
    if (user && navigateToSell) {
      // If user is logged in, suggest selling.
      actionButton = (
        <button
          onClick={navigateToSell}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <PlusCircleIcon />
          <span>List Your First Item</span>
        </button>
      );
    } else if (!user && navigateToAuth) {
      // If user is not logged in, suggest signing in to sell.
      actionButton = (
        <button
          onClick={() => navigateToAuth("login")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <UserCircleIcon className="mr-2" />{" "}
          {/* Ensure UserCircleIcon can take className */}
          Sign In to Sell
        </button>
      );
    }
  }
  // Scenario 2: Global search is active, and no significant local filters are applied, yielding no results.
  else if (
    globalSearchTerm &&
    (!activeFilters ||
      (activeFilters.category === "" &&
        !activeFilters.priceRange?.min &&
        !activeFilters.priceRange?.max))
  ) {
    title = `No items found for "${globalSearchTerm}"`;
    description = "Try a different search term or broaden your search.";
    if (onClearSearchAndFilters) {
      // Provide a button to clear search and filters.
      actionButton = (
        <button
          onClick={onClearSearchAndFilters}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Clear Search & Filters
        </button>
      );
    }
  }
  // Scenario 3: Local filters are active (with or without global search), yielding no results.
  else if (
    activeFilters &&
    (activeFilters.category !== "" ||
      activeFilters.priceRange?.min ||
      activeFilters.priceRange?.max)
  ) {
    title = "No items match your current filters";
    description = "Try adjusting or clearing your filters to see more items.";
    if (onClearSearchAndFilters) {
      // Provide a button to clear filters.
      actionButton = (
        <button
          onClick={onClearSearchAndFilters}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Clear Filters
        </button>
      );
    }
  }
  // The default message (initial values) covers cases where `areAnyItemsAvailable` is true
  // but `processedItems` is empty due to some combination of filters/search not caught above.

  // This component would then use these variables to render its UI.
  // For example, using a structure similar to the GlobalEmptyState:
  return (
    <div className="text-center py-16 px-4">
      {/* Dynamically render an icon based on iconType if you have an icon map */}
      {/* <IconComponent className="w-16 h-16 mx-auto text-gray-400 mb-4" /> */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {actionButton && (
        <div className="flex justify-center">{actionButton}</div>
      )}
    </div>
  );
};

export default BuyingEmptyState;
