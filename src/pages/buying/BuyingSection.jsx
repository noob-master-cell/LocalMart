// This component serves as the main container for the "Buying" feature.
// It orchestrates the display of items available for sale, provides filtering and sorting options,
// and manages the overall user experience for Browse and finding items.
// It utilizes the `useBuyingData` hook for state management and business logic.

import React, { useCallback } from "react";

// Custom hook for managing buying data and logic.
import useBuyingData from "./hooks/useBuyingData.js";
// Constants specific to the buying feature, like categories.
import { BUYING_CATEGORIES } from "./hooks/buyingConstants.js";

// Sub-components specific to this feature.
import BuyingHeader from "./components/BuyingHeader.jsx";
import ItemsList from "./components/ItemsList.jsx"; // Renders ItemCards for items for sale.
import BuyingEmptyState from "./components/EmptyState.jsx"; // Buying-specific empty state messages.

// Globally shared components.
import CompactFilterBar from "../../components/Filters/CompactFilterBar/CompactFilterBar.jsx";
// Skeleton loader for initial loading state.
import PageLoadingSkeleton from "./../../components/UI/LoadingSkeletons";

/**
 * BuyingSection component.
 *
 * @param {object} props - Props passed from the parent component (e.g., AppLayout).
 * @param {object|null} props.user - The currently authenticated user (for ItemCard interactions).
 * @param {Function} props.showMessage - Callback function to display global messages.
 * @param {string} props.globalSearchTerm - The global search term from AppLayout.
 * @param {Function} props.onSearchTermChange - Callback to update/clear the global search term in AppLayout.
 */
const BuyingSection = ({
  user,
  showMessage,
  globalSearchTerm,
  onSearchTermChange,
}) => {
  // Destructure state and functions from the useBuyingData hook.
  const {
    allItems, // All items fetched initially (before client-side filtering).
    loading, // Loading state for initial data fetch.
    filters, // Current local filters for this section (category, sortBy, priceRange).
    processedItems, // Items after all filters (global and local) and sorting.
    setFilters, // Function to update local filters.
  } = useBuyingData(showMessage, globalSearchTerm); // Initialize the hook.

  // Callback for the CompactFilterBar to update local filters.
  const handleLocalFilterChange = useCallback(
    (newFilters) => {
      setFilters(newFilters);
    },
    [setFilters] // Dependency: setFilters function from the hook.
  );

  // Callback for the BuyingHeader to clear both global search and local filters.
  const handleClearSearchAndFilters = useCallback(() => {
    onSearchTermChange?.(""); // Clear global search term via AppLayout's handler.
    // Reset local filters to their default state.
    setFilters({
      category: "",
      sortBy: "newest",
      priceRange: { min: "", max: "" },
    });
  }, [onSearchTermChange, setFilters]); // Dependencies for the callback.

  // Fallback handler for contacting a seller.
  // This might be passed down to ItemCard -> ItemDetailModal if not handled directly there.
  const handleContactSellerFallback = useCallback(
    (item) => {
      if (!user) {
        // Check if user is logged in.
        showMessage?.("Please log in to contact sellers.", "info");
        return;
      }
      if (!item.whatsappNumber) {
        // Check if WhatsApp number is provided.
        showMessage?.(
          `Seller for "${item.name}" has not provided a direct WhatsApp number. You may find contact details in the item description if available.`,
          "info"
        );
        return;
      }
      // If ItemCard/ItemDetailModal handles the WhatsApp link generation and opening directly,
      // this function might serve as a general information point or for alternative contact methods.
      // Example: showMessage(`Attempting to contact seller for "${item.name}"...`, "info");
    },
    [user, showMessage] // Dependencies for the callback.
  );

  // Show a loading skeleton only on the initial full load when no items are present yet.
  if (loading && allItems.length === 0) {
    return <PageLoadingSkeleton type="buying" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header for the buying section: title, item counts, search display. */}
      <BuyingHeader
        totalItemsCount={allItems.length} // Display total before any client-side filtering.
        processedItemsCount={processedItems.length}
        globalSearchTerm={globalSearchTerm}
        onClearSearchAndFilters={handleClearSearchAndFilters}
        // `filters` could be passed if the header needs to display local filter states.
      />

      {/* CompactFilterBar for local filtering (category, sort, price). */}
      <CompactFilterBar
        onFilterChange={handleLocalFilterChange}
        // Categories for the filter bar, prepending "All" for clearing category filter.
        categories={["All", ...BUYING_CATEGORIES]}
        showPriceFilter={true} // Price filter is relevant for buying.
        showSortOptions={true} // Sorting options are relevant.
        showStatusFilter={false} // Status filter (e.g., lost/found) is not used here.
        initialFilters={filters} // Pass current local filters to initialize the bar.
        className="mb-8"
      />

      {/* Conditional rendering: Display empty state or the list of items. */}
      {processedItems.length === 0 ? (
        // Display BuyingEmptyState if no items match filters or if the marketplace is empty.
        <BuyingEmptyState
          areAnyItemsAvailable={allItems.length > 0} // True if DB has items, but filters/search yield none.
          globalSearchTerm={globalSearchTerm}
          activeFilters={filters} // Pass all current local filters.
          onClearSearchAndFilters={handleClearSearchAndFilters}
          user={user} // For "List Your First Item" suggestion if marketplace is empty.
          // navigateToSell={/* function to navigate to sell page */} // Optional prop.
        />
      ) : (
        // Display ItemsList if there are items to show.
        <ItemsList
          itemsToDisplay={processedItems}
          user={user} // For ItemCard interactions (e.g., contact seller button behavior).
          showMessage={showMessage} // For feedback from ItemCard.
          isLostAndFound={false} // Indicates these are not Lost & Found items.
          onContactItem={handleContactSellerFallback} // Or ItemCard handles contact directly.
          // Props for pagination/load more could be added here if implemented.
        />
      )}
      {/* Placeholder for pagination controls or "Load More" button if ItemsList doesn't handle it. */}
    </div>
  );
};

export default BuyingSection;
