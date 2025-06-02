// src/pages/itemPage/ItemPageComponent.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Ensure this path is correct for your db instance
import firebaseService from "../../services/firebaseService"; // For collection names
import { PageLoadingSkeleton } from "../../components/UI/LoadingSkeletons.jsx";
import ItemDetailModal from "../../components/Items/ItemDetailModal/ItemDetailModal.jsx";
import NotFound from "../../components/Navigation/NotFound.jsx";

const ItemPageComponent = ({ user, showMessage }) => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemType, setItemType] = useState(null); // 'sell' or 'lostfound'

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
        // Try fetching from sell_items collection
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
          // If not in sell_items, try lostfound_items
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
          setError("Item not found.");
        }
      } catch (e) {
        console.error("Error fetching item:", e);
        setError(`Failed to load item details: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  const handleCloseModalAndNavigate = () => {
    // Navigate to a relevant page when the modal's "close" is triggered
    navigate(itemType === "lostfound" ? "/lostfound" : "/buy");
  };

  if (loading) {
    return <PageLoadingSkeleton type="buying" />;
  }

  if (error || !item) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <NotFound />
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-8">
      {/* Using ItemDetailModal to display the item details on this page */}
      <ItemDetailModal
        item={item}
        isOpen={true} // The "modal" is the content of this page, so it's always "open"
        onClose={handleCloseModalAndNavigate} // Define what happens when the modal's close button is clicked
        showMessage={showMessage}
        user={user}
        isLostAndFound={itemType === "lostfound"}
        // hideContactButton={user && user.uid === item.userId} // Optional: logic for contact button
      />
    </div>
  );
};

export default ItemPageComponent;
