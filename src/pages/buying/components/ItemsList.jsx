// This component is responsible for rendering a list of item cards for the "Buying" section.
// It takes an array of processed (filtered and sorted) items and displays them using the
// reusable ItemCard component.

import React from "react";
// ItemCard is the reusable component for displaying individual item details.
import ItemCard from "./../../../components/Items/ItemCard/ItemCard";

/**
 * ItemsList component for the buying section.
 *
 * @param {object} props - The component's props.
 * @param {Array<object>} props.itemsToDisplay - An array of item objects to be rendered.
 * These are typically the `processedItems` from the `useBuyingData` hook.
 * @param {object|null} props.user - The current authenticated user, passed to ItemCard
 * for its internal logic (e.g., behavior of the contact button).
 * @param {Function} props.showMessage - Callback function to display global messages,
 * passed to ItemCard for any feedback it might need to show.
 * @param {Function} props.onContactItem - Callback for when a contact action is initiated
 * from an ItemCard (if not handled by ItemCard directly).
 * @param {boolean} [props.isLoadingMore] - Optional: Flag for infinite scroll loading state.
 * @param {Function} [props.handleLoadMore] - Optional: Callback for infinite scroll.
 */
const ItemsList = ({
  itemsToDisplay,
  user,
  showMessage,
  onContactItem,
  // isLoadingMore, // Example for pagination/infinite scroll
  // handleLoadMore, // Example for pagination/infinite scroll
}) => {
  return (
    // Grid layout for displaying items. Responsive columns.
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Map through the items and render an ItemCard for each one. */}
      {itemsToDisplay.map((item) => (
        <ItemCard
          key={item.id} // Unique key for React's list rendering.
          item={item}
          user={user}
          showMessage={showMessage}
          isLostAndFound={false} // This is for buying, so items are not L&F.
          onContact={onContactItem} // Pass the contact handler to ItemCard.
          // `hideContactButton` defaults to false for buying (i.e., show contact button).
        />
      ))}
    </div>
    // Placeholder for a "Load More" button or an intersection observer
    // if pagination or infinite scrolling is implemented for the buying section.
    // {isLoadingMore && <div>Loading more items...</div>}
    // {!isLoadingMore && hasMore && <button onClick={handleLoadMore}>Load More</button>}
  );
};

export default ItemsList;
