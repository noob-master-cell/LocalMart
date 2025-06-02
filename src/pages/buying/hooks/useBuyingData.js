// This custom React hook encapsulates the business logic and state management
// for the "Buying" section. It handles fetching all items available for sale,
// applying global search, local filters (category, price range), and sorting.

import { useState, useEffect, useCallback, useMemo } from "react";
// Firebase imports for database interactions.
import {
  db,
  appId, // Used for namespacing Firestore collection paths.
} from "../../../firebase.jsx";
import {
  collection,
  query,
  onSnapshot, // For real-time updates to the list of items.
  orderBy, // For default sorting (e.g., by creation date).
  // `where` could be used for initial filtering if, for example, items had an "available" status.
} from "firebase/firestore";

// Constants for categories might be imported if used for default filter state,
// but typically the component (`BuyingSection`) imports them for the UI.
// import { BUYING_CATEGORIES } from "./buyingConstants.js";

/**
 * Custom hook for managing buying data and operations.
 *
 * @param {Function} showMessage - Callback function to display global messages/notifications.
 * @param {string} [globalSearchTerm=""] - The global search term from the application header.
 * @returns {object} An object containing state and functions for the buying section.
 */
const useBuyingData = (showMessage, globalSearchTerm = "") => {
  // State for storing all 'sell' items fetched from Firestore.
  const [allItems, setAllItems] = useState([]);
  // Loading state for initial data fetching.
  const [loading, setLoading] = useState(true);
  // Local filters applied to the items (category, sort order, price range).
  const [filters, setFilters] = useState({
    category: "",
    sortBy: "newest",
    priceRange: { min: "", max: "" },
    // No 'status' filter here as this section fetches items for sale (implicitly "available").
  });

  // Firestore collection path for items for sale.
  const itemsCollectionPath = `artifacts/${appId}/public/data/sell_items`;

  // Effect to fetch all items for sale.
  // Uses onSnapshot for real-time updates if items are added/modified/deleted.
  useEffect(() => {
    setLoading(true);
    const itemsRef = collection(db, itemsCollectionPath);
    // Initial query: order by creation date (newest first).
    // More complex default sorting might require specific Firestore indexes.
    const q = query(itemsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const itemsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllItems(itemsData);
        setLoading(false);
      },
      (error) => {
        console.error(
          "Error fetching items for sale in useBuyingData: ",
          error
        );
        showMessage?.(
          `Error fetching items: ${error.message}. Please try again.`,
          "error"
        );
        setLoading(false);
      }
    );

    // Cleanup: unsubscribe from the listener when component unmounts or dependencies change.
    return () => unsubscribe();
  }, [itemsCollectionPath, showMessage]); // `showMessage` is included if it might change.

  // Callback to handle changes in local filters.
  const handleFilterChange = useCallback((newFilterValues) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilterValues, // Allows partial updates to filters.
      // Ensure priceRange is always an object.
      priceRange: newFilterValues.priceRange ||
        prevFilters.priceRange || { min: "", max: "" },
    }));
  }, []);

  // Memoized derivation of items after applying global search and local filters/sorting.
  const processedItems = useMemo(() => {
    let filtered = [...allItems]; // Start with all fetched 'sell' items.

    // Apply global search term.
    if (globalSearchTerm) {
      const term = globalSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.category?.toLowerCase().includes(term)
      );
    }

    // Apply category filter.
    if (filters.category && filters.category !== "All") {
      // "All" means no category filter.
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    // Apply price range filter.
    if (filters.priceRange) {
      if (filters.priceRange.min !== "" && filters.priceRange.min !== null) {
        filtered = filtered.filter(
          (item) => item.price >= parseFloat(filters.priceRange.min)
        );
      }
      if (filters.priceRange.max !== "" && filters.priceRange.max !== null) {
        filtered = filtered.filter(
          (item) => item.price <= parseFloat(filters.priceRange.max)
        );
      }
    }

    // Apply sorting.
    switch (filters.sortBy) {
      case "newest":
        filtered.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
        );
        break;
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "alphabetical":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      default:
        // Default sort (newest) is typically handled by the initial query or previous case.
        break;
    }
    return filtered;
  }, [allItems, globalSearchTerm, filters]);

  // Return state and functions to be used by the BuyingSection component.
  return {
    allItems, // All items before any client-side filtering (useful for total counts).
    loading, // Loading state.
    filters, // Current local filters.
    setFilters: handleFilterChange, // Function to update local filters.
    processedItems, // Items after all filtering and sorting, ready for display.
    // `buyingCategories` can be imported directly by the BuyingSection component if needed.
  };
};

export default useBuyingData;
