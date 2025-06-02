// This component is responsible for displaying the detailed view of a single item.
// It fetches the item data based on the `itemId` from the URL parameters
// and uses the `ItemDetailModal` component to render the item's information.
// Although named "Modal", ItemDetailModal is used here as the main page content.

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Hooks for URL parameters and navigation.
import { doc, getDoc } from "firebase/firestore"; // Firestore functions to fetch a document.
import { db } from "../../firebase"; // Firebase database instance.
import firebaseService from "../../services/firebaseService"; // Service for collection names.
import { PageLoadingSkeleton } from "../../components/UI/LoadingSkeletons.jsx"; // Skeleton loader.
import ItemDetailModal from "../../components/Items/ItemDetailModal/ItemDetailModal.jsx"; // Component to display item details.
import NotFound from "../../components/Navigation/NotFound.jsx"; // Component for 404 or item not found state.

/**
 * ItemPageComponent - Renders a detailed page for a specific item.
 *
 * @param {object} props - Component props.
 * @param {object|null} props.user - The currently authenticated user.
 * @param {Function} props.showMessage - Function to display global messages.
 */
const ItemPageComponent = ({ user, showMessage }) => {
  const { itemId } = useParams(); // Get `itemId` from the URL.
  const navigate = useNavigate(); // Hook for programmatic navigation.

  const [item, setItem] = useState(null); // State to store the fetched item data.
  const [loading, setLoading] = useState(true); // Loading state for data fetching.
  const [error, setError] = useState(null); // Error state for fetching issues.
  const [itemType, setItemType] = useState(null); // Type of the item ('sell' or 'lostfound').

  // Effect to fetch the item data when `itemId` changes.
  useEffect(() => {
    if (!itemId) {
      setError("No item ID provided.");
      setLoading(false);
      return;
    }

    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      let fetchedItemData = null;
      let type = null;

      try {
        // Attempt to fetch from the 'sell_items' collection first.
        const sellItemRef = doc(
          db,
          firebaseService.collections.sellItems,
          itemId
        );
        const sellItemSnap = await getDoc(sellItemRef);

        if (sellItemSnap.exists()) {
          fetchedItemData = { id: sellItemSnap.id, ...sellItemSnap.data() };
          type = "sell";
        } else {
          // If not found in 'sell_items', try 'lostfound_items' collection.
          const lfItemRef = doc(
            db,
            firebaseService.collections.lostFoundItems,
            itemId
          );
          const lfItemSnap = await getDoc(lfItemRef);
          if (lfItemSnap.exists()) {
            fetchedItemData = { id: lfItemSnap.id, ...lfItemSnap.data() };
            type = "lostfound";
          }
        }

        if (fetchedItemData) {
          setItem(fetchedItemData);
          setItemType(type);
        } else {
          setError("Item not found."); // Item not found in either collection.
        }
      } catch (e) {
        console.error("Error fetching item:", e);
        setError(`Failed to load item details: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]); // Re-run effect if itemId changes.

  // Handler for closing the "modal" (which is the page content here).
  // Navigates the user to a relevant overview page based on the item type.
  const handleCloseModalAndNavigate = () => {
    navigate(itemType === "lostfound" ? "/lostfound" : "/buy");
  };

  // Display loading skeleton while fetching data.
  if (loading) {
    // 'buying' type skeleton is a generic page skeleton.
    return <PageLoadingSkeleton type="buying" />;
  }

  // Display error message or NotFound component if fetching failed or item not found.
  if (error || !item) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <NotFound /> {/* Generic 404/Not Found UI */}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    );
  }

  // Render the ItemDetailModal as the main content of this page.
  return (
    <div className="container mx-auto py-4 sm:py-8">
      <ItemDetailModal
        item={item}
        isOpen={true} // The "modal" is effectively always open as it's the page content.
        onClose={handleCloseModalAndNavigate} // Define close behavior.
        showMessage={showMessage}
        user={user}
        isLostAndFound={itemType === "lostfound"}
        // `hideContactButton` could be used if, for example, the current user is the item owner.
        // hideContactButton={user && user.uid === item.userId}
      />
    </div>
  );
};

export default ItemPageComponent;
