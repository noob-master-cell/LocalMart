// src/pages/selling/components/EmptyState.jsx

import React from "react";
// Assuming your global EmptyState component is at this path
import GlobalEmptyState from "./../../../components/UI/EmptyState.jsx";
import PlusCircleIcon from "./../../../components/icons/PlusCircleIcon.jsx"; // For the "List Your First Item" button

const SellingEmptyState = ({
  isUserItemsEmpty, // Boolean: true if the user has no items listed at all
  globalSearchTerm, // The current global search term, if any
  onOpenAddModal, // Function to open the modal to add a new item
  // You could also pass 'activeFilters' if you want to customize messages based on specific filters
}) => {
  let icon = "search"; // Default icon
  let title = "No items found";
  let description =
    "No items match your current filters. Try adjusting your search criteria.";
  let actionButton = null;

  if (isUserItemsEmpty) {
    icon = "shopping"; // Or a specific "add item" icon if you have one
    title = "No items listed yet";
    description =
      "Start selling by listing your first item. It's quick and easy!";
    actionButton = (
      <button
        onClick={onOpenAddModal}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
      >
        <PlusCircleIcon />
        <span>List Your First Item</span>
      </button>
    );
  } else if (globalSearchTerm) {
    // This case is when there are items, but none match the global search
    icon = "search";
    title = "No items found for your search";
    description = `No items match "${globalSearchTerm}". Try different keywords or adjust your filters.`;
    // Optionally, add a "Clear Search" or "Clear Filters" button here
  }
  // You can add more conditions here if you pass 'activeFilters' and want to customize
  // the message for "No items match your filters" vs "No items match your search".

  return (
    <div className="mt-8">
      {" "}
      {/* Or other appropriate wrapper */}
      <GlobalEmptyState
        icon={icon}
        title={title}
        description={description}
        actionButton={actionButton}
        className="py-16" // You can adjust styling as needed
      />
    </div>
  );
};

export default SellingEmptyState;
