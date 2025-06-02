// src/pages/buying/hooks/useBuyingData.js

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  db,
  appId, // Assuming appId is used for collection paths
} from "../../../firebase.jsx"; // Adjust path as necessary
import {
  collection,
  query,
  onSnapshot,
  orderBy, // Potentially add where for initial filtering if needed (e.g., only "available" items if you add such a status)
} from "firebase/firestore";

const useBuyingData = (showMessage, globalSearchTerm = "") => {
  const [allItems, setAllItems] = useState([]); // All 'sell' items fetched from Firestore
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    sortBy: "newest",
    priceRange: { min: "", max: "" },
    // No 'status' filter here as we're fetching all sellable items
  });

  const itemsCollectionPath = `artifacts/${appId}/public/data/sell_items`;

  // Fetch all items for sale
  useEffect(() => {
    setLoading(true);
    const itemsRef = collection(db, itemsCollectionPath);
    // Initially, you might want to order by creation date
    // More complex default sorting might require specific Firestore indexes
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

    return () => unsubscribe();
  }, [itemsCollectionPath, showMessage]); // showMessage added as a dependency

  // Handle Filter Changes
  const handleFilterChange = useCallback((newFilterValues) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilterValues, // This allows partial updates, e.g., just { category: 'Electronics' }
      priceRange: newFilterValues.priceRange ||
        prevFilters.priceRange || { min: "", max: "" },
    }));
  }, []);

  // Processed (Filtered and Sorted) Items
  const processedItems = useMemo(() => {
    let filtered = [...allItems]; // Start with all fetched items

    // Apply global search term
    if (globalSearchTerm) {
      const term = globalSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.category?.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== "All") {
      // Assuming "All" means no filter
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    // Apply price range filter
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

    // Apply sort order
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
        // Default sort (newest) already applied by initial query or previous case
        break;
    }
    return filtered;
  }, [allItems, globalSearchTerm, filters]);

  // Return state and functions
  return {
    allItems, // Could be useful for displaying total count before filtering
    loading,
    filters,
    setFilters: handleFilterChange, // Expose filter update mechanism
    processedItems, // Filtered and sorted items to display
    // buyingCategories: BUYING_CATEGORIES, // BuyingSection can import this directly
  };
};

export default useBuyingData;
