// This component is responsible for rendering a list of Lost & Found item cards.
// It adapts the generic ItemCard component for the specific needs of the Lost & Found section,
// including owner-specific actions (Edit, Delete) and contact functionality.

import React from "react";
// ItemCard is a reusable component for displaying individual item details.
import ItemCard from "./../../../components/Items/ItemCard/ItemCard.jsx";

/**
 * ItemsList component for the Lost & Found section.
 *
 * @param {object} props - The component's props.
 * @param {Array<object>} props.itemsToDisplay - An array of L&F item objects to render.
 * @param {Function} props.onOpenEditModal - Callback to open the modal for editing an L&F item.
 * @param {Function} props.onDeleteItem - Callback to handle deletion of an L&F item.
 * @param {boolean} props.isOperationInProgress - Flag indicating if an operation (e.g., delete) is ongoing.
 * @param {object|null} props.user - The current authenticated user.
 * @param {Function} props.showMessage - Callback to display global messages.
 * @param {Function} props.onContactItem - Callback to handle contacting the poster of an L&F item.
 */
const ItemsList = ({
  itemsToDisplay,
  onOpenEditModal,
  onDeleteItem,
  isOperationInProgress,
  user,
  showMessage,
  onContactItem, // Callback for initiating contact, passed to ItemCard.
}) => {
  return (
    // Grid layout for displaying items. Responsive columns.
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {/* Map through the items and render an ItemCard for each. */}
      {itemsToDisplay.map((item) => {
        // Determine owner-specific actions (Edit, Delete).
        // Shown only if a user is logged in and their UID matches the item's userId.
        const ownerActions =
          user && user.uid === item.userId ? (
            <>
              {/* Edit button */}
              <button
                onClick={() => onOpenEditModal(item)}
                disabled={isOperationInProgress}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white text-sm font-semibold py-2 px-3 rounded-md transition-colors disabled:cursor-not-allowed"
              >
                Edit
              </button>
              {/* Delete button */}
              <button
                onClick={() => onDeleteItem(item.id)}
                disabled={isOperationInProgress}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-semibold py-2 px-3 rounded-md transition-colors disabled:cursor-not-allowed"
              >
                {/* Show "..." if an operation is in progress, otherwise "Delete". */}
                {isOperationInProgress ? "..." : "Delete"}
              </button>
            </>
          ) : null; // No actions if the user is not the owner.

        return (
          // ItemCard component customized for Lost & Found items.
          <ItemCard
            key={item.id}
            item={item}
            isLostAndFound={true} // Indicates this card is for an L&F item.
            showMessage={showMessage}
            user={user}
            onContact={onContactItem} // Pass the contact handler.
            actionElements={ownerActions} // Pass owner-specific action buttons.
            statusIndicator={item.status || "lost"} // Pass item status for visual cues (e.g., border color).
            // ItemCard is expected to handle its own height and layout.
          />
        );
      })}
    </div>
  );
};

export default ItemsList;
