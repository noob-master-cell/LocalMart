// src/pages/lostfound/components/ItemsList.jsx

import React from "react";
// Assuming your global ItemCard component is at this path
import ItemCard from "./../../../components/Items/ItemCard/ItemCard.jsx"; // Adjust path as needed

const ItemsList = ({
  itemsToDisplay,
  onOpenEditModal,
  onDeleteItem,
  isOperationInProgress,
  user,
  showMessage,
  onContactItem,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
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
          <ItemCard
            key={item.id}
            item={item}
            isLostAndFound={true}
            showMessage={showMessage}
            user={user}
            onContact={onContactItem}
            actionElements={ownerActions}
            statusIndicator={item.status || "lost"} // Pass status for border styling
            // className="h-full" // ItemCard already defines h-full
          />
        );
      })}
    </div>
  );
};

export default ItemsList;
