// src/pages/selling/SellingSection.jsx

import React, { useCallback } from "react"; // Removed useState, useEffect, useMemo if all handled by hook

// Hooks and Constants for this feature
import useSellingData from "./hooks/useSellingData.js";
import { SELLING_CATEGORIES } from "./hooks/sellingConstants.js";

// Sub-components for this feature
import SellingHeader from "./components/SellingHeader.jsx";
import ItemsList from "./components/ItemsList.jsx";
import SellingEmptyState from "./components/EmptyState.jsx"; // Renamed to avoid confusion with global EmptyState

// Globally shared components (adjust paths as per your final structure)
import ItemForm from "./../../components/Items/ItemForm/ItemForm.jsx";
import CompactFilterBar from "./../../components/Filters/CompactFilterBar/CompactFilterBar.jsx";
import { PageLoadingSkeleton } from "./../../components/UI/LoadingSkeletons.jsx";
import Modal from "./../../components/Modal";

const SellingSection = ({
  user, // Prop from AppLayout
  showMessage, // Prop from AppLayout
  globalSearchTerm, // Prop from AppLayout
  onSearchTermChange, // Prop from AppLayout (to clear global search)
}) => {
  const {
    // State from hook
    userItems,
    loading,
    filters,
    processedItems,
    isModalOpen,
    editingItem,
    isFormProcessing,
    operationInProgress,
    // Actions/callbacks from hook
    setFilters, // Or your handleFilterChange if you expose that instead
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmitItem,
    handleDeleteItem,
    setIsFormProcessing, // For ItemForm
  } = useSellingData(user, showMessage, globalSearchTerm);

  // Callback for CompactFilterBar
  const handleFilterBarChange = useCallback(
    (newFilters) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  // Callback to clear global search (if SellingHeader handles this)
  const handleClearGlobalSearch = useCallback(() => {
    onSearchTermChange?.(""); // Notify AppLayout to clear global search
    // Potentially also clear local feature filters if desired:
    // setFilters({ category: '', sortBy: 'newest', priceRange: { min: '', max: '' } });
  }, [onSearchTermChange]);

  if (loading && userItems.length === 0) {
    // Show skeleton only on initial load
    return <PageLoadingSkeleton type="selling" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SellingHeader
        globalSearchTerm={globalSearchTerm}
        onClearGlobalSearch={handleClearGlobalSearch}
        onOpenAddModal={openAddModal}
        user={user} // Pass user if header needs it (e.g., to enable/disable add button)
      />

      {userItems.length > 0 && ( // Show filter bar only if there are any items at all
        <CompactFilterBar
          onFilterChange={handleFilterBarChange}
          categories={["All", ...SELLING_CATEGORIES]} // Pass "All" explicitly or ensure SELLING_CATEGORIES includes it if needed
          showPriceFilter={true} // Specific to selling
          showSortOptions={true} // Specific to selling
          showStatusFilter={false} // Not used in selling
          initialFilters={filters}
          className="mb-8"
        />
      )}

      {/* Display number of items */}
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

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? "Edit Item" : "Add New Item for Sale"}
        size="lg" // Or your preferred default
      >
        <ItemForm
          onSubmit={handleSubmitItem}
          initialData={editingItem || {}} // Pass empty for new, or existing data for edit
          type="sell" // Crucial for ItemForm's behavior
          onFormProcessing={setIsFormProcessing} // ItemForm can signal its busy state
        />
      </Modal>

      {processedItems.length === 0 ? (
        <SellingEmptyState
          isUserItemsEmpty={userItems.length === 0}
          globalSearchTerm={globalSearchTerm}
          onOpenAddModal={openAddModal}
          // You might want to pass filters here too, to customize the message
        />
      ) : (
        <ItemsList
          itemsToDisplay={processedItems}
          onOpenEditModal={openEditModal}
          onDeleteItem={handleDeleteItem}
          isOperationInProgress={operationInProgress}
          user={user} // For ItemCard actions or display
          showMessage={showMessage} // For ItemCard actions
          // onContactItem is not typically needed for user's own selling list
        />
      )}

      {/* Selling Tips (can be a separate component too if it grows) */}
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
