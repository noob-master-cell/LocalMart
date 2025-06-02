// src/pages/buying/components/ItemsList.jsx

import React from "react";
// Assuming your global ItemCard component is at this path
import ItemCard from "./../../../components/Items/ItemCard/ItemCard";

const ItemsList = ({
  itemsToDisplay, // These are the 'processedItems' from the useBuyingData hook
  user, // Current authenticated user, passed to ItemCard for its internal logic (e.g., contact button behavior)
  showMessage, // Passed to ItemCard for any messages it might need to show
  onContactItem, // Callback for when a contact action is initiated from an ItemCard (if not handled by ItemCard directly)
  // Add other props like 'handleLoadMore' or 'isLoadingMore' if you implement pagination/infinite scroll
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {itemsToDisplay.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          user={user}
          showMessage={showMessage}
          isLostAndFound={false} // This is for buying, so it's not a Lost & Found item
          onContact={onContactItem} // Pass the contact handler to ItemCard
          // hideContactButton={false} // By default, show contact button for buying
        />
      ))}
    </div>
    // You might include a "Load More" button or an intersection observer for infinite scrolling here
  );
};

export default ItemsList;
