// src/pages/buying/BuyingSection.jsx

import React, { useCallback } from "react"; // Add other React hooks if needed

// Hooks and Constants for this feature
import useBuyingData from "./hooks/useBuyingData.js";
import { BUYING_CATEGORIES } from "./hooks/buyingConstants.js";

// Sub-components for this feature
import BuyingHeader from "./components/BuyingHeader.jsx";
import ItemsList from "./components/ItemsList.jsx"; // This will render ItemCards
import BuyingEmptyState from "./components/EmptyState.jsx"; // Buying-specific empty state

// Globally shared components
import CompactFilterBar from "../../components/Filters/CompactFilterBar/CompactFilterBar.jsx";

import PageLoadingSkeleton from "./../../components/UI/LoadingSkeletons";
const BuyingSection = ({
  user, // Prop from AppLayout (for ItemCard interactions, e.g., contact seller)
  showMessage, // Prop from AppLayout (for user feedback)
  globalSearchTerm, // Prop from AppLayout
  onSearchTermChange, // Prop from AppLayout (to clear global search)
}) => {
  const {
    // State from useBuyingData hook
    allItems, // All items fetched initially
    loading,
    filters, // Current local filters for this section
    processedItems, // Items after all filters (global and local) and sorting
    // Actions from useBuyingData hook
    setFilters, // Function to update local filters
  } = useBuyingData(showMessage, globalSearchTerm); // Pass showMessage and globalSearchTerm to the hook

  // Callback for CompactFilterBar filter changes
  const handleLocalFilterChange = useCallback(
    (newFilters) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  // Callback for BuyingHeader to clear all search/filters
  const handleClearSearchAndFilters = useCallback(() => {
    onSearchTermChange?.(""); // Clear global search term via AppLayout's handler
    setFilters({
      // Reset local filters to default
      category: "",
      sortBy: "newest",
      priceRange: { min: "", max: "" },
    });
  }, [onSearchTermChange, setFilters]);

  // Contact seller fallback (if not handled directly by ItemCard or ItemDetailModal)
  // This might be passed to ItemsList -> ItemCard -> ItemDetailModal
  const handleContactSellerFallback = useCallback(
    (item) => {
      if (!user) {
        showMessage?.("Please log in to contact sellers.", "info");
        return;
      }
      if (!item.whatsappNumber) {
        showMessage?.(
          `Seller for "${item.name}" has not provided a direct WhatsApp number. You may find contact details in the item description if available.`,
          "info"
        );
      }
      // If ItemCard/ItemDetailModal handles the WhatsApp link directly, this might just be for general info.
    },
    [user, showMessage]
  );

  if (loading && allItems.length === 0) {
    // Show skeleton only on initial full load
    return <PageLoadingSkeleton type="buying" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BuyingHeader
        totalItemsCount={allItems.length} // Display total before filtering
        processedItemsCount={processedItems.length}
        globalSearchTerm={globalSearchTerm}
        onClearSearchAndFilters={handleClearSearchAndFilters}
        // Potentially pass local filters if header needs to display them
        // filters={filters}
      />

      <CompactFilterBar
        onFilterChange={handleLocalFilterChange}
        categories={["All", ...BUYING_CATEGORIES]}
        showPriceFilter={true}
        showSortOptions={true}
        showStatusFilter={false} // No status filter for buying general items
        initialFilters={filters}
        className="mb-8"
      />

      {processedItems.length === 0 ? (
        <BuyingEmptyState
          areAnyItemsAvailable={allItems.length > 0} // True if DB has items, but filters/search yield none
          globalSearchTerm={globalSearchTerm}
          activeFilters={filters} // Pass all current filters
          onClearSearchAndFilters={handleClearSearchAndFilters}
          user={user} // For "List Your First Item" if no items in DB at all
          // navigateToSell might be a prop if you want to navigate from EmptyState
        />
      ) : (
        <ItemsList
          itemsToDisplay={processedItems}
          user={user} // For ItemCard interactions
          showMessage={showMessage} // For ItemCard
          isLostAndFound={false} // Differentiates ItemCard behavior/styling
          onContactItem={handleContactSellerFallback} // Or ItemCard handles contact directly
          // Add pagination/load more props if implementing
        />
      )}
      {/* Pagination or "Load More" button could go here if ItemsList doesn't handle it */}
    </div>
  );
};

export default BuyingSection;
