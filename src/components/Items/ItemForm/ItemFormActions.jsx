import React from "react";

/**
 * @component ItemFormActions
 * @description Renders the primary action button for an item form (e.g., submit button).
 * The button text dynamically changes based on the form's mode (edit/create) and type (sell/lostfound).
 *
 * @param {object} props - The properties passed to the component.
 * @param {boolean} props.isSubmitting - Indicates if the form is currently being submitted.
 * @param {boolean} props.isEditMode - True if the form is in edit mode, false for create mode.
 * @param {string} props.type - The type of item form ('sell' or 'lostfound').
 * @param {string} props.initialDataStatus - The status of the item if it's a lost/found item (e.g., 'lost', 'found').
 * @param {boolean} props.hasImages - Indicates if any images have been added to the form.
 * @returns {JSX.Element} The action button for the item form.
 */
const ItemFormActions = ({
  isSubmitting,
  isEditMode,
  type,
  initialDataStatus, // Status like 'lost' or 'found'
  hasImages, // To disable button if no images are present
}) => {
  /**
   * Determines the appropriate text for the submit button.
   * @returns {string} The button text.
   */
  const getButtonText = () => {
    if (isSubmitting) {
      return isEditMode ? "Updating..." : "Adding...";
    }
    if (isEditMode) {
      return "Update Item";
    }
    // For create mode
    if (type === "sell") {
      return "Add Item for Sale";
    }
    // For lostfound type in create mode
    return initialDataStatus === "found" ? "Post Found Item" : "Post Lost Item";
  };

  return (
    <button
      type="submit"
      // Disable button if submitting or if no images are provided (a common requirement)
      disabled={isSubmitting || !hasImages}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      {getButtonText()}
    </button>
  );
};

export default React.memo(ItemFormActions);
