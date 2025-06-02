// This component is responsible for rendering a list of item cards.
// It's used in the "Selling" section to display the user's own items for sale.
// It provides action buttons (Edit, Delete) for each item if the current user is the owner.

import React from "react";
// The ItemCard component is a reusable component for displaying individual item details.
import ItemCard from "./../../../components/Items/ItemCard/ItemCard.jsx";

/**
 * ItemsList component for the selling section.
 *
 * @param {object} props - The component's props.
 * @param {Array<object>} props.itemsToDisplay - An array of item objects to be rendered.
 * @param {Function} props.onOpenEditModal - Callback function to open the modal for editing an item.
 * @param {Function} props.onDeleteItem - Callback function to handle item deletion.
 * @param {boolean} props.isOperationInProgress - Flag indicating if an operation (like delete) is ongoing.
 * @param {object|null} props.user - The current authenticated user.
 * @param {Function} props.showMessage - Callback function to display global messages.
 */
const ItemsList = ({
  itemsToDisplay,
  onOpenEditModal,
  onDeleteItem,
  isOperationInProgress,
  user,
  showMessage,
}) => {
  return (
    // Grid layout for displaying items. Responsive columns.
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Map through the items and render an ItemCard for each one. */}
      {itemsToDisplay.map((item) => {
        // Determine if owner-specific actions (Edit, Delete) should be available.
        // These actions are only shown if a user is logged in and their UID matches the item's userId.
        const ownerActions =
          user && user.uid === item.userId ? (
            <>
              {/* Edit button */}
              <button
                onClick={() => onOpenEditModal(item)}
                disabled={isOperationInProgress} // Disable if another operation is in progress.
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white text-sm font-semibold py-2 px-3 rounded-md transition-colors disabled:cursor-not-allowed"
              >
                Edit
              </button>
              {/* Delete button */}
              <button
                onClick={() => onDeleteItem(item.id)}
                disabled={isOperationInProgress} // Disable if another operation is in progress.
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-semibold py-2 px-3 rounded-md transition-colors disabled:cursor-not-allowed"
              >
                {/* Show "..." if an operation is in progress, otherwise "Delete". */}
                {isOperationInProgress ? "..." : "Delete"}
              </button>
            </>
          ) : null; // No actions if the user is not the owner.

        return (
          // ItemCard component to display the item.
          // The key is crucial for React's list rendering performance.
          // `actionElements` prop passes the owner-specific buttons to the ItemCard.
          <ItemCard
            key={item.id}
            item={item}
            showMessage={showMessage}
            user={user}
            hideContactButton={true} // Contact button is typically hidden for user's own items.
            actionElements={ownerActions} // Pass the constructed action buttons.
            // ItemCard is expected to handle its own height and internal layout (e.g., `h-full`).
          />
        );
      })}
    </div>
  );
};

export default ItemsList;
