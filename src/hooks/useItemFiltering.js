import { useMemo } from "react";

export const useItemFiltering = (
  items,
  filters,
  globalSearchTerm = "",
  itemType = "sell"
) => {
  return useMemo(() => {
    if (!items) return [];

    let filteredItems = [...items];

    // Global search filter
    if (globalSearchTerm) {
      const term = globalSearchTerm.toLowerCase();
      filteredItems = filteredItems.filter((item) => {
        const nameMatch = item.name?.toLowerCase().includes(term);
        const descriptionMatch = item.description?.toLowerCase().includes(term);
        const categoryMatch = item.category?.toLowerCase().includes(term);
        let locationMatch = false;
        if (itemType === "lostfound") {
          locationMatch = item.lastSeenLocation?.toLowerCase().includes(term);
        }
        return nameMatch || descriptionMatch || categoryMatch || locationMatch;
      });
    }

    // Category filter
    if (filters.category && filters.category !== "All") {
      filteredItems = filteredItems.filter(
        (item) => item.category === filters.category
      );
    }

    // Price range filter (for sell items)
    if (itemType === "sell" && filters.priceRange) {
      if (filters.priceRange.min) {
        filteredItems = filteredItems.filter(
          (item) => item.price >= parseFloat(filters.priceRange.min)
        );
      }
      if (filters.priceRange.max) {
        filteredItems = filteredItems.filter(
          (item) => item.price <= parseFloat(filters.priceRange.max)
        );
      }
    }

    // Status filter (for lost & found items - already pre-filtered by Firebase query, but good for client-side consistency if needed)
    // Note: The main status filtering for Lost & Found is now primarily done at the Firebase query level in LostAndFoundSection.jsx
    // This client-side filter can act as a secondary check or if items from different statuses were ever mixed client-side.
    if (itemType === "lostfound" && filters.status) {
      filteredItems = filteredItems.filter(
        (item) => item.status === filters.status
      );
    }

    // Sort items
    switch (filters.sortBy) {
      case "newest":
        filteredItems.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
        break;
      case "oldest":
        filteredItems.sort(
          (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
        );
        break;
      case "price-low":
        if (itemType === "sell") {
          filteredItems.sort((a, b) => (a.price || 0) - (b.price || 0));
        }
        break;
      case "price-high":
        if (itemType === "sell") {
          filteredItems.sort((a, b) => (b.price || 0) - (a.price || 0));
        }
        break;
      case "alphabetical":
        filteredItems.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );
        break;
      default:
        break;
    }
    return filteredItems;
  }, [items, filters, globalSearchTerm, itemType]);
};
