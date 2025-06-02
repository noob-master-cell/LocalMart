// src/pages/selling/components/ItemsList.jsx

import React from "react";
import ItemCard from "./../../../components/Items/ItemCard/ItemCard.jsx"; // Adjust path as needed

const ItemsList = ({
  itemsToDisplay,
  onOpenEditModal,
  onDeleteItem,
  isOperationInProgress,
  user,
  showMessage,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {itemsToDisplay.map((item) => {
        const ownerActions =
          user && user.uid === item.userId ? (
            <>
              <button
                onClick={() => onOpenEditModal(item)}
                disabled={isOperationInProgress}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white text-sm font-semibold py-2 px-3 rounded-md transition-colors disabled:cursor-not-allowed"
              >
                Edit
              </button>
              <button
                onClick={() => onDeleteItem(item.id)}
                disabled={isOperationInProgress}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-semibold py-2 px-3 rounded-md transition-colors disabled:cursor-not-allowed"
              >
                {isOperationInProgress ? "..." : "Delete"}
              </button>
            </>
          ) : null;

        return (
          // The ItemCard itself provides the main card styling (shadow, rounded corners, etc.)
          // The key should be on the ItemCard if it's the top-level element per item,
          // or on a wrapper div if one is truly necessary for grid layout beyond what ItemCard provides.
          // Assuming ItemCard's root is sufficient for the grid child:
          <ItemCard
            key={item.id}
            item={item}
            showMessage={showMessage}
            user={user}
            hideContactButton={true}
            actionElements={ownerActions} // Pass the constructed action buttons
            // className="h-full" // ItemCard already has flex flex-col h-full
          />
        );
      })}
    </div>
  );
};

export default ItemsList;
