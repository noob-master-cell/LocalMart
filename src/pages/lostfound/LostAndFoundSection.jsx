// This component serves as the main container for the Lost & Found feature.
// It orchestrates the display of lost or found items, filters, an add/edit item modal,
// and handles user interactions for this section.
// It utilizes the `useLostFoundData` hook for state management and business logic.

import React, { useCallback, useMemo } from "react";

// Custom hook for managing Lost & Found data and logic.
import useLostFoundData from "./hooks/useLostFoundData.js";
// Constants specific to the Lost & Found feature (categories, status options).
import {
  LOSTFOUND_CATEGORIES,
  STATUS_OPTIONS,
} from "./hooks/lostFoundConstants.js";

// Sub-components specific to this feature.
import LostFoundHeader from "./components/LostFoundHeader.jsx";
import ItemsList from "./components/ItemsList.jsx"; // Renders L&F item cards.
import LostFoundEmptyState from "./components/EmptyState.jsx"; // L&F specific empty state.

// Globally shared components.
import ItemForm from "./../../components/items/ItemForm/ItemForm.jsx"; // Form for adding/editing L&F items.
import CompactFilterBar from "./../../components/Filters/CompactFilterBar/CompactFilterBar.jsx";
import { PageLoadingSkeleton } from "./../../components/UI/LoadingSkeletons.jsx"; // Skeleton loader.
// General item status constants, might be used for ItemForm initial data.
import { ITEM_STATUS } from "./../../config/constants.js";
import Modal from "./../../components/UI/Modal/index"; // Reusable modal component.

/**
 * LostAndFoundSection component.
 *
 * @param {object} props - Props passed from AppLayout.
 * @param {object|null} props.user - Currently authenticated user.
 * @param {Function} props.showMessage - Function to display global messages.
 * @param {Function} props.navigateToAuth - Function to navigate to authentication pages.
 * @param {string} props.globalSearchTerm - Global search term from AppLayout.
 * @param {Function} props.onSearchTermChange - Callback to update/clear global search term in AppLayout.
 */
const LostAndFoundSection = ({
  user,
  showMessage,
  navigateToAuth,
  globalSearchTerm,
  onSearchTermChange,
}) => {
  // Destructure state and functions from the useLostFoundData hook.
  const {
    items, // Raw items fetched for the current L&F status (lost/found).
    loading,
    filters, // Current local filters (category, sortBy, status).
    processedItems, // Items after applying global search and local filters.
    isModalOpen,
    editingItem,
    // isFormProcessing, // ItemForm signals its state via setIsFormProcessing.
    operationInProgress,
    setFilters, // Function to update local filters.
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmitItem,
    handleDeleteItem,
    setIsFormProcessing, // Callback for ItemForm to indicate its processing state.
  } = useLostFoundData(user, showMessage, globalSearchTerm); // Initialize the hook.

  // Callback for filter changes from CompactFilterBar or LostFoundHeader.
  const handleFilterChange = useCallback(
    (newFilterValues) => {
      setFilters(newFilterValues); // This will trigger re-fetch in useLostFoundData if status changes.
    },
    [setFilters] // Dependency: setFilters from the hook.
  );

  // Callback to clear the global search term.
  const handleClearGlobalSearch = useCallback(() => {
    onSearchTermChange?.("");
  }, [onSearchTermChange]);

  // Determine initial status for ItemForm when adding a new L&F item.
  // This ensures the form defaults to the currently active L&F status (lost or found).
  const initialFormStatus = useMemo(() => {
    return filters.status === ITEM_STATUS.FOUND
      ? { status: ITEM_STATUS.FOUND }
      : { status: ITEM_STATUS.LOST };
  }, [filters.status]); // Dependency: current status filter.

  // Show a loading skeleton only on initial load for the current L&F status (lost/found).
  if (loading && items.length === 0) {
    return <PageLoadingSkeleton type="lostfound" />;
  }

  return (
    <div className="container mx-auto px-3 py-4">
      {/* Header for the Lost & Found section: title, item count, status toggles, add button. */}
      <LostFoundHeader
        itemCount={processedItems.length}
        globalSearchTerm={globalSearchTerm}
        onClearGlobalSearch={handleClearGlobalSearch}
        filters={filters}
        onFilterChange={handleFilterChange} // Used by status (Lost/Found) buttons.
        statusOptions={STATUS_OPTIONS}
        onOpenAddModal={openAddModal}
        user={user}
        navigateToAuth={navigateToAuth}
      />

      {/* CompactFilterBar for categories and sorting.
          Displayed in different positions for mobile and desktop. */}
      <div className="sm:hidden bg-white shadow-sm rounded-lg p-2 mb-4">
        {/* Mobile placement of filter bar. */}
        <CompactFilterBar
          onFilterChange={handleFilterChange} // For category and sort filters.
          categories={["All", ...LOSTFOUND_CATEGORIES]} // Prepend "All" for clearing category filter.
          showPriceFilter={false} // Price filter is not relevant for L&F.
          showSortOptions={true} // Sorting options are relevant.
          showStatusFilter={false} // Status is handled by LostFoundHeader buttons.
          initialFilters={filters}
        />
      </div>
      <div className="hidden sm:block mb-3">
        {/* Desktop placement of filter bar. */}
        <CompactFilterBar
          onFilterChange={handleFilterChange}
          categories={["All", ...LOSTFOUND_CATEGORIES]}
          showPriceFilter={false}
          showSortOptions={true}
          showStatusFilter={false}
          initialFilters={filters}
        />
      </div>

      {/* Modal for adding or editing a Lost & Found item. */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          editingItem
            ? "Edit Post"
            : `Post ${
                filters.status === ITEM_STATUS.LOST ? "Lost" : "Found"
              } Item`
        }
        size="lg" // Modal size.
      >
        {/* ItemForm component within the modal. */}
        <ItemForm
          onSubmit={handleSubmitItem}
          // For new items, initialData merges current L&F status with empty fields.
          // For editing, `editingItem` (which includes status) is used.
          initialData={editingItem || initialFormStatus}
          type="lostfound" // Crucial for ItemForm's behavior and fields.
          onFormProcessing={setIsFormProcessing} // Allows ItemForm to update processing state.
        />
      </Modal>

      {/* Conditional rendering: Display empty state or the list of L&F items. */}
      {processedItems.length === 0 ? (
        // Display LostFoundEmptyState if no items match or if DB is empty for current status.
        <LostFoundEmptyState
          currentStatus={filters.status} // e.g., "lost" or "found".
          isItemsEmptyForStatus={items.length === 0} // True if DB has no items for the current L&F status.
          globalSearchTerm={globalSearchTerm}
          activeFilters={{ category: filters.category, sortBy: filters.sortBy }} // Pass local filters.
          onOpenAddModal={openAddModal}
          onClearGlobalSearch={handleClearGlobalSearch}
          // Action to clear local filters (category and sort), keeping the current status.
          onClearLocalFilters={() =>
            handleFilterChange({
              category: "",
              sortBy: "newest",
              status: filters.status, // Preserve current status when clearing other local filters.
            })
          }
          user={user}
          navigateToAuth={navigateToAuth}
        />
      ) : (
        // Display ItemsList for Lost & Found items.
        <ItemsList
          itemsToDisplay={processedItems}
          onOpenEditModal={openEditModal} // If L&F items can be edited by owner.
          onDeleteItem={handleDeleteItem} // If L&F items can be deleted by owner.
          isOperationInProgress={operationInProgress}
          user={user}
          showMessage={showMessage}
          isLostAndFound={true} // Differentiates ItemCard styling/actions.
          onContactItem={(item) => {
            // Define contact logic (e.g., open WhatsApp or show message).
            // This is often handled directly within ItemCard or ItemDetailModal,
            // but a fallback or additional logic can be placed here.
            showMessage(`Contacting poster of "${item.name}"...`, "info");
          }}
          // Props for pagination/infinite scroll could be added here if implemented.
        />
      )}
      {/* Placeholder for a "Load More" button if not using infinite scroll. */}
    </div>
  );
};

export default LostAndFoundSection;