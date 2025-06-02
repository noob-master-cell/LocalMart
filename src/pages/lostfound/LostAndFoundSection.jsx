// src/pages/lostfound/LostAndFoundSection.jsx

import React, { useCallback, useMemo } from "react"; // Add other React hooks if needed directly here

// Hooks and Constants for this feature
import useLostFoundData from "./hooks/useLostFoundData.js";
import {
  LOSTFOUND_CATEGORIES,
  STATUS_OPTIONS,
} from "./hooks/lostFoundConstants.js";

// Sub-components for this feature
import LostFoundHeader from "./components/LostFoundHeader.jsx";
import ItemsList from "./components/ItemsList.jsx"; // Assuming a similar ItemsList component
import LostFoundEmptyState from "./components/EmptyState.jsx"; // Lost & Found specific empty state

// Globally shared components (adjust paths as per your final structure)
import ItemForm from "./../../components/items/ItemForm/ItemForm.jsx"; // Assuming ItemForm is shared
import CompactFilterBar from "./../../components/Filters/CompactFilterBar/CompactFilterBar.jsx";
import { PageLoadingSkeleton } from "./../../components/UI/LoadingSkeletons.jsx";
import { ITEM_STATUS } from "./../../config/constants.js"; // General ITEM_STATUS if needed by ItemForm initialData
import Modal from "./../../components/UI/Modal/index";

const LostAndFoundSection = ({
  user, // Prop from AppLayout
  showMessage, // Prop from AppLayout
  navigateToAuth, // Prop from AppLayout
  globalSearchTerm, // Prop from AppLayout
  onSearchTermChange, // Prop from AppLayout (to clear global search)
}) => {
  const {
    // State from hook
    items, // Raw items for the current status
    loading,
    filters, // Current filters { category, sortBy, status }
    processedItems, // Filtered and sorted items
    isModalOpen,
    editingItem,
    isFormProcessing,
    operationInProgress,
    // Actions/callbacks from hook
    setFilters, // Function to update filters
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmitItem,
    handleDeleteItem,
    setIsFormProcessing, // For ItemForm
  } = useLostFoundData(user, showMessage, globalSearchTerm);

  // Callback for CompactFilterBar or LostFoundHeader filter changes
  const handleFilterChange = useCallback(
    (newFilterValues) => {
      setFilters(newFilterValues); // This will trigger re-fetch in useLostFoundData if status changes
    },
    [setFilters]
  );

  const handleClearGlobalSearch = useCallback(() => {
    onSearchTermChange?.("");
  }, [onSearchTermChange]);

  // Determine initial status for ItemForm when adding a new item
  const initialFormStatus = useMemo(() => {
    // When opening the "add" modal, the form should reflect the currently active L&F status
    return filters.status === ITEM_STATUS.FOUND
      ? { status: ITEM_STATUS.FOUND }
      : { status: ITEM_STATUS.LOST };
  }, [filters.status]);

  if (loading && items.length === 0) {
    // Show skeleton only on initial load for the current status
    return <PageLoadingSkeleton type="lostfound" />;
  }

  return (
    <div className="container mx-auto px-3 py-4">
      <LostFoundHeader
        itemCount={processedItems.length}
        globalSearchTerm={globalSearchTerm}
        onClearGlobalSearch={handleClearGlobalSearch}
        filters={filters}
        onFilterChange={handleFilterChange} // For status buttons (lost/found)
        statusOptions={STATUS_OPTIONS}
        onOpenAddModal={openAddModal}
        user={user}
        navigateToAuth={navigateToAuth}
      />

      {/* CompactFilterBar for categories and sorting */}
      <div className="sm:hidden bg-white shadow-sm rounded-lg p-2 mb-4">
        {" "}
        {/* Mobile specific placement */}
        <CompactFilterBar
          onFilterChange={handleFilterChange} // For category and sort
          categories={["All", ...LOSTFOUND_CATEGORIES]}
          showPriceFilter={false}
          showSortOptions={true}
          showStatusFilter={false} // Status is handled by LostFoundHeader buttons
          initialFilters={filters}
        />
      </div>
      <div className="hidden sm:block mb-3">
        {" "}
        {/* Desktop placement */}
        <CompactFilterBar
          onFilterChange={handleFilterChange}
          categories={["All", ...LOSTFOUND_CATEGORIES]}
          showPriceFilter={false}
          showSortOptions={true}
          showStatusFilter={false}
          initialFilters={filters}
        />
      </div>

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
        size="lg"
      >
        <ItemForm
          onSubmit={handleSubmitItem}
          // For new items, initialData merges current status with empty fields
          // For editing, editingItem is used.
          initialData={editingItem || initialFormStatus}
          type="lostfound" // Crucial for ItemForm's behavior
          onFormProcessing={setIsFormProcessing}
        />
      </Modal>

      {processedItems.length === 0 ? (
        <LostFoundEmptyState
          currentStatus={filters.status} // e.g., "lost" or "found"
          isItemsEmptyForStatus={items.length === 0} // True if no items for current L/F status from DB
          globalSearchTerm={globalSearchTerm}
          activeFilters={{ category: filters.category, sortBy: filters.sortBy }} // Pass local filters
          onOpenAddModal={openAddModal}
          onClearGlobalSearch={handleClearGlobalSearch}
          onClearLocalFilters={() =>
            handleFilterChange({
              category: "",
              sortBy: "newest",
              status: filters.status,
            })
          }
          user={user}
          navigateToAuth={navigateToAuth}
        />
      ) : (
        // Assuming you'll create/reuse an ItemsList component similar to the selling feature
        // It would need to be adapted for Lost & Found specific card actions/display
        <ItemsList
          itemsToDisplay={processedItems}
          onOpenEditModal={openEditModal} // If L&F items can be edited
          onDeleteItem={handleDeleteItem} // If L&F items can be deleted by owner
          isOperationInProgress={operationInProgress}
          user={user}
          showMessage={showMessage}
          isLostAndFound={true} // To differentiate ItemCard styling/actions
          onContactItem={(item) => {
            /* Define contact logic if needed */
          }}
          // visibleItemsCount and handleLoadMore if you implement pagination/infinite scroll
        />
      )}
      {/* You might want a "Load More" button here if not using infinite scroll in ItemsList */}
    </div>
  );
};

export default LostAndFoundSection;
