// Items/ItemForm/ItemFormActions.jsx
import React from "react";

const ItemFormActions = ({
  isSubmitting,
  isEditMode,
  type,
  initialDataStatus,
  hasImages,
}) => {
  const getButtonText = () => {
    if (isSubmitting) {
      return isEditMode ? "Updating..." : "Adding...";
    }
    if (isEditMode) {
      return "Update Item";
    }
    if (type === "sell") {
      return "Add Item for Sale";
    }
    return initialDataStatus === "found" ? "Post Found Item" : "Post Lost Item";
  };

  return (
    <button
      type="submit"
      disabled={isSubmitting || !hasImages}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      {getButtonText()}
    </button>
  );
};

export default React.memo(ItemFormActions);
