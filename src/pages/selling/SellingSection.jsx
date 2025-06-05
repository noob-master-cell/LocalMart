// src/pages/selling/SellingSection.jsx
import React, { useCallback, useMemo } from "react"; // Import useMemo

import useSellingData from "./hooks/useSellingData.js";
import { SELLING_CATEGORIES } from "./hooks/sellingConstants.js";

import SellingHeader from "./components/SellingHeader.jsx";
import ItemsList from "./components/ItemsList.jsx";
import SellingEmptyState from "./components/EmptyState.jsx";

import ItemForm from "./../../components/Items/ItemForm/ItemForm.jsx";
import CompactFilterBar from "./../../components/Filters/CompactFilterBar/CompactFilterBar.jsx";
import { PageLoadingSkeleton } from "./../../components/UI/LoadingSkeletons.jsx";
import Modal from "./../../components/Modal";

const SellingSection = ({
  user,
  showMessage,
  globalSearchTerm,
  onSearchTermChange,
}) => {
  const {
    userItems,
    loading,
    filters,
    processedItems,
    isModalOpen,
    editingItem,
    operationInProgress,
    setFilters,
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmitItem,
    handleDeleteItem,
    setIsFormProcessing,
  } = useSellingData(user, showMessage, globalSearchTerm);

  const handleFilterBarChange = useCallback(
    (newFilters) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  const handleClearGlobalSearch = useCallback(() => {
    onSearchTermChange?.("");
  }, [onSearchTermChange]);

  // --- FIX STARTS HERE ---
  // Memoize the initialData object to ensure it's stable for ItemForm
  const memoizedInitialData = useMemo(() => {
    return editingItem || {}; // This object literal is now created only when editingItem changes
  }, [editingItem]); // Dependency array includes editingItem
  // --- FIX ENDS HERE ---

  if (loading && userItems.length === 0) {
    return <PageLoadingSkeleton type="selling" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SellingHeader
        globalSearchTerm={globalSearchTerm}
        onClearGlobalSearch={handleClearGlobalSearch}
        onOpenAddModal={openAddModal}
        user={user}
      />

      {userItems.length > 0 && (
        <CompactFilterBar
          onFilterChange={handleFilterBarChange}
          categories={["All", ...SELLING_CATEGORIES]}
          showPriceFilter={true}
          showSortOptions={true}
          showStatusFilter={false}
          initialFilters={filters}
          className="mb-8"
        />
      )}

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
        size="lg"
      >
        <ItemForm
          onSubmit={handleSubmitItem}
          initialData={memoizedInitialData} // Use the memoized initialData here
          type="sell"
          onFormProcessing={setIsFormProcessing}
        />
      </Modal>

      {processedItems.length === 0 ? (
        <SellingEmptyState
          isUserItemsEmpty={userItems.length === 0}
          globalSearchTerm={globalSearchTerm}
          onOpenAddModal={openAddModal}
        />
      ) : (
        <ItemsList
          itemsToDisplay={processedItems}
          onOpenEditModal={openEditModal}
          onDeleteItem={handleDeleteItem}
          isOperationInProgress={operationInProgress}
          user={user}
          showMessage={showMessage}
        />
      )}

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
