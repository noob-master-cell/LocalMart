// src/pages/buying/components/EmptyState.jsx

import React from "react";
// Assuming your global EmptyState component is at this path

// Icons that might be used for action buttons
import PlusCircleIcon from "../../../components/icons/PlusCircleIcon.jsx"; // If suggesting to sell
import UserCircleIcon from "../../../components/Icons/UserCircleIcon.jsx";

/**
 * Empty state component specifically for the buying section
 * Handles different scenarios: no items available, search results, filter results
 */
const BuyingEmptyState = ({
  areAnyItemsAvailable, // Boolean: true if there are items in the database, false if DB is empty for sell_items
  globalSearchTerm,
  activeFilters, // e.g., { category, sortBy, priceRange }
  onClearSearchAndFilters, // Function to clear global search and local filters
  user, // Current authenticated user (to suggest selling if they are logged in)
  navigateToSell, // Optional: function to navigate to the selling page
  navigateToAuth, // Optional: function to navigate to auth page
}) => {
  let icon = "search";
  let title = "No items match your criteria";
  let description =
    "Try adjusting your search or filter settings, or check back later for new listings.";
  let actionButton = null;

  if (!areAnyItemsAvailable) {
    icon = "shopping"; // Or a "shop empty" icon
    title = "The marketplace is empty right now!";
    description =
      "No items have been listed for sale yet. Why not be the first to sell something?";
    if (user && navigateToSell) {
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
      actionButton = (
        <button
          onClick={() => navigateToAuth("login")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <UserCircleIcon className="mr-2" />
          Sign In to Sell
        </button>
      );
    }
  } else if (
    globalSearchTerm &&
    (!activeFilters ||
      (activeFilters.category === "" &&
        !activeFilters.priceRange?.min &&
        !activeFilters.priceRange?.max))
  ) {
    // Only global search term yields no results
    title = `No items found for "${globalSearchTerm}"`;
    description = "Try a different search term or broaden your search.";
    if (onClearSearchAndFilters) {
      actionButton = (
        <button
          onClick={onClearSearchAndFilters}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Clear Search & Filters
        </button>
      );
    }
  } else if (
    activeFilters &&
    (activeFilters.category !== "" ||
      activeFilters.priceRange?.min ||
      activeFilters.priceRange?.max)
  ) {
    // Local filters yield no results (with or without global search)
    title = "No items match your current filters";
    description = "Try adjusting or clearing your filters to see more items.";
    if (onClearSearchAndFilters) {
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
  // Default message is handled by initial values if no items match processedItems but areAnyItemsAvailable is true.
};

export default BuyingEmptyState;
