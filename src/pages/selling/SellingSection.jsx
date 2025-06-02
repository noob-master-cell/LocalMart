// This component is the main container for the "Your Items for Sale" (Selling) feature.
// It orchestrates the display of the user's listed items, filters,
// an add/edit item modal, and handles interactions related to managing these items.
// It utilizes the `useSellingData` hook for state management and business logic.

import React, { useCallback } from "react";

// Custom hook for managing selling data and logic.
import useSellingData from "./hooks/useSellingData.js";
// Constants specific to the selling feature, like categories.
import { SELLING_CATEGORIES } from "./hooks/sellingConstants.js";

// Sub-components specific to this feature.
import SellingHeader from "./components/SellingHeader.jsx";
import ItemsList from "./components/ItemsList.jsx";
import SellingEmptyState from "./components/EmptyState.jsx";

// Globally shared components used in this section.
import ItemForm from "./../../components/Items/ItemForm/ItemForm.jsx"; // Form for adding/editing items.
import CompactFilterBar from "./../../components/Filters/CompactFilterBar/CompactFilterBar.jsx";
import { PageLoadingSkeleton } from "./../../components/UI/LoadingSkeletons.jsx"; // Skeleton loader.
import Modal from "./../../components/Modal"; // Reusable modal component.

/**
 * SellingSection component.
 *
 * @param {object} props - Props passed from the parent component (e.g., AppLayout).
 * @param {object|null} props.user - The currently authenticated user object.
 * @param {Function} props.showMessage - Callback function to display global messages.
 * @param {string} props.globalSearchTerm - The global search term from AppLayout.
 * @param {Function} props.onSearchTermChange - Callback to update/clear the global search term in AppLayout.
 */
const SellingSection = ({
  user,
  showMessage,
  globalSearchTerm,
  onSearchTermChange,
}) => {
  // Destructure state and functions from the useSellingData hook.
  const {
    userItems, // Raw list of items owned by the user.
    loading, // Loading state for initial data fetch.
    filters, // Current local filters (category, sortBy, priceRange).
    processedItems, // Items after applying global search and local filters.
    isModalOpen, // Boolean indicating if the add/edit modal is open.
    editingItem, // The item currently being edited (null if adding).
    // isFormProcessing,    // Not directly used here; ItemForm signals its state via `setIsFormProcessing`.
    operationInProgress, // Flag for ongoing operations like delete.
    setFilters, // Function to update local filters.
    openAddModal, // Function to open the add item modal.
    openEditModal, // Function to open the edit item modal.
    closeModal, // Function to close the modal.
    handleSubmitItem, // Function to handle item form submission (add/edit).
    handleDeleteItem, // Function to handle item deletion.
    setIsFormProcessing, // Callback for ItemForm to indicate its processing state.
  } = useSellingData(user, showMessage, globalSearchTerm); // Initialize the hook.

  // Callback for the CompactFilterBar to update local filters.
  const handleFilterBarChange = useCallback(
    (newFilters) => {
      setFilters(newFilters);
    },
    [setFilters] // Dependency: setFilters function from the hook.
  );

  // Callback to clear the global search term.
  // This is typically triggered by the SellingHeader component.
  const handleClearGlobalSearch = useCallback(() => {
    onSearchTermChange?.(""); // Notify AppLayout to clear the global search.
    // Optionally, reset local filters when global search is cleared:
    // setFilters({ category: '', sortBy: 'newest', priceRange: { min: '', max: '' } });
  }, [onSearchTermChange]); // Dependency: onSearchTermChange from AppLayout.

  // Show a loading skeleton only on the initial load when there are no items yet.
  if (loading && userItems.length === 0) {
    return <PageLoadingSkeleton type="selling" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header for the selling section: title, search display, add item button. */}
      <SellingHeader
        globalSearchTerm={globalSearchTerm}
        onClearGlobalSearch={handleClearGlobalSearch}
        onOpenAddModal={openAddModal}
        user={user} // Pass user to enable/disable add button based on auth state.
      />

      {/* Display the filter bar only if the user has listed at least one item. */}
      {userItems.length > 0 && (
        <CompactFilterBar
          onFilterChange={handleFilterBarChange}
          // Categories for the filter bar, prepending "All" for an option to clear category filter.
          categories={["All", ...SELLING_CATEGORIES]}
          showPriceFilter={true} // Price filter is relevant for selling.
          showSortOptions={true} // Sorting options are relevant.
          showStatusFilter={false} // Status filter (e.g., lost/found) is not used here.
          initialFilters={filters} // Pass current local filters to initialize the bar.
          className="mb-8"
        />
      )}

      {/* Display the count of items shown versus total user items. */}
      {userItems.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {processedItems.length === 0
              ? "No items match your criteria."
              : `Showing ${processedItems.length} of ${userItems.length} items${
                  processedItems.length !== userItems.length
                    ? " (filtered)"
                    : ""
                }`}
          </p>
        </div>
      )}

      {/* Modal for adding or editing an item. */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? "Edit Item" : "Add New Item for Sale"}
        size="lg" // Specify modal size.
      >
        {/* ItemForm component within the modal. */}
        <ItemForm
          onSubmit={handleSubmitItem}
          initialData={editingItem || {}} // Pass editingItem data or empty object for new item.
          type="sell" // Specify form type as "sell".
          onFormProcessing={setIsFormProcessing} // Allows ItemForm to update processing state.
        />
      </Modal>

      {/* Conditional rendering: Display empty state or the list of items. */}
      {processedItems.length === 0 ? (
        // Display SellingEmptyState if no items match filters or if user has no items.
        <SellingEmptyState
          isUserItemsEmpty={userItems.length === 0}
          globalSearchTerm={globalSearchTerm}
          onOpenAddModal={openAddModal}
          // activeFilters={filters} // Optionally pass local filters for more specific empty state messages.
        />
      ) : (
        // Display ItemsList if there are items to show.
        <ItemsList
          itemsToDisplay={processedItems}
          onOpenEditModal={openEditModal}
          onDeleteItem={handleDeleteItem}
          isOperationInProgress={operationInProgress}
          user={user} // Pass user for ItemCard actions (e.g., edit/delete).
          showMessage={showMessage} // Pass showMessage for feedback from ItemCard actions.
        />
      )}

      {/* Display selling tips if there are items listed and some are visible. */}
      {userItems.length > 0 && processedItems.length > 0 && (
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Selling Tips
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Add clear, well-lit photos to attract more buyers</li>
            <li>• Write detailed descriptions to answer common questions</li>
            <li>• Respond quickly to interested buyers via WhatsApp</li>
            <li>• Keep your listings up-to-date</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SellingSection;
