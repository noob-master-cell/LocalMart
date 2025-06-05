// src/pages/lostfound/LostAndFoundSection.jsx
import React, { useCallback, useMemo } from "react"; // Import useMemo

import useLostFoundData from "./hooks/useLostFoundData.js";
import {
  LOSTFOUND_CATEGORIES,
  STATUS_OPTIONS,
} from "./hooks/lostFoundConstants.js";

import LostFoundHeader from "./components/LostFoundHeader.jsx";
import ItemsList from "./components/ItemsList.jsx";
import LostFoundEmptyState from "./components/EmptyState.jsx";

import ItemForm from "./../../components/Items/ItemForm/ItemForm.jsx";
import CompactFilterBar from "./../../components/Filters/CompactFilterBar/CompactFilterBar.jsx";
import { PageLoadingSkeleton } from "./../../components/UI/LoadingSkeletons.jsx";
import { ITEM_STATUS } from "./../../config/constants.js";
import Modal from "./../../components/UI/Modal/index";

const LostAndFoundSection = ({
  user,
  showMessage,
  navigateToAuth,
  globalSearchTerm,
  onSearchTermChange,
}) => {
  const {
    items,
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
  } = useLostFoundData(user, showMessage, globalSearchTerm);

  const handleFilterChange = useCallback(
    (newFilterValues) => {
      setFilters(newFilterValues);
    },
    [setFilters]
  );

  const handleClearGlobalSearch = useCallback(() => {
    onSearchTermChange?.("");
  }, [onSearchTermChange]);

  const initialFormStatus = useMemo(() => {
    return filters.status === ITEM_STATUS.FOUND
      ? { status: ITEM_STATUS.FOUND }
      : { status: ITEM_STATUS.LOST };
  }, [filters.status]);

  // --- FIX STARTS HERE ---
  // Memoize the initialData object for ItemForm to prevent unnecessary re-renders
  const memoizedItemFormInitialData = useMemo(() => {
    return editingItem || initialFormStatus; // This ensures a stable object reference
  }, [editingItem, initialFormStatus]); // Dependencies: editingItem and the stable initialFormStatus
  // --- FIX ENDS HERE ---

  if (loading && items.length === 0) {
    return <PageLoadingSkeleton type="lostfound" />;
  }

  return (
    <div className="container mx-auto px-3 py-4">
      <LostFoundHeader
        itemCount={processedItems.length}
        globalSearchTerm={globalSearchTerm}
        onClearGlobalSearch={handleClearGlobalSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
        statusOptions={STATUS_OPTIONS}
        onOpenAddModal={openAddModal}
        user={user}
        navigateToAuth={navigateToAuth}
      />

      <div className="sm:hidden bg-white shadow-sm rounded-lg p-2 mb-4">
        <CompactFilterBar
          onFilterChange={handleFilterChange}
          categories={["All", ...LOSTFOUND_CATEGORIES]}
          showPriceFilter={false}
          showSortOptions={true}
          showStatusFilter={false}
          initialFilters={filters}
        />
      </div>
      <div className="hidden sm:block mb-3">
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
          initialData={memoizedItemFormInitialData} // Use the memoized initialData here
          type="lostfound"
          onFormProcessing={setIsFormProcessing}
        />
      </Modal>

      {processedItems.length === 0 ? (
        <LostFoundEmptyState
          currentStatus={filters.status}
          isItemsEmptyForStatus={items.length === 0}
          globalSearchTerm={globalSearchTerm}
          activeFilters={{ category: filters.category, sortBy: filters.sortBy }}
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
        <ItemsList
          itemsToDisplay={processedItems}
          onOpenEditModal={openEditModal}
          onDeleteItem={handleDeleteItem}
          isOperationInProgress={operationInProgress}
          user={user}
          showMessage={showMessage}
          isLostAndFound={true}
          onContactItem={(item) => {
            showMessage(`Contacting poster of "${item.name}"...`, "info");
          }}
        />
      )}
    </div>
  );
};

export default LostAndFoundSection;
