// This custom React hook encapsulates the logic for filtering and sorting an array of items.
// It takes a list of items, filter criteria, a global search term, and an item type (e.g., 'sell', 'lostfound')
// and returns a memoized, processed list of items.

import { useMemo } from "react";

/**
 * `useItemFiltering` hook.
 * Filters and sorts an array of items based on provided criteria.
 *
 * @param {Array<object>} items - The array of item objects to process.
 * @param {object} filters - An object containing filter criteria:
 * `category` (string): Category to filter by. "All" or empty means no category filter.
 * `sortBy` (string): Criterion for sorting (e.g., "newest", "price-low").
 * `priceRange` (object, optional): { min, max } for price filtering (used if `itemType` is 'sell').
 * `status` (string, optional): Status to filter by (e.g., "lost", "found", used if `itemType` is 'lostfound').
 * @param {string} [globalSearchTerm=""] - A global search term to filter items by name, description, etc.
 * @param {string} [itemType="sell"] - The type of items being filtered ('sell' or 'lostfound').
 * This affects which filters (like priceRange or status) are applied.
 * @returns {Array<object>} A memoized array of the filtered and sorted items.
 */
export const useItemFiltering = (
  items,
  filters,
  globalSearchTerm = "",
  itemType = "sell" // Default to 'sell' type if not specified.
) => {
  // `useMemo` is used to recompute the filtered/sorted list only when its dependencies change.
  return useMemo(() => {
    // Return an empty array if `items` is null or undefined.
    if (!items) return [];

    // Start with a shallow copy of the items array to avoid mutating the original.
    let filteredItems = [...items];

    // 1. Global Search Filter (case-insensitive)
    if (globalSearchTerm) {
      const term = globalSearchTerm.toLowerCase();
      filteredItems = filteredItems.filter((item) => {
        // Check for matches in item name, description, and category.
        const nameMatch = item.name?.toLowerCase().includes(term);
        const descriptionMatch = item.description?.toLowerCase().includes(term);
        const categoryMatch = item.category?.toLowerCase().includes(term);
        let locationMatch = false;
        // For 'lostfound' items, also search in `lastSeenLocation`.
        if (itemType === "lostfound") {
          locationMatch = item.lastSeenLocation?.toLowerCase().includes(term);
        }
        return nameMatch || descriptionMatch || categoryMatch || locationMatch;
      });
    }

    // 2. Category Filter
    // Apply if a category is selected and it's not the "All" placeholder.
    if (filters.category && filters.category !== "All") {
      filteredItems = filteredItems.filter(
        (item) => item.category === filters.category
      );
    }

    // 3. Price Range Filter (only for 'sell' items)
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

    // 4. Status Filter (primarily for 'lostfound' items)
    // Note: For Lost & Found, the primary status filtering (lost/found) is often done
    // at the data fetching level (e.g., Firebase query). This client-side filter
    // can act as a secondary check or if items with different statuses were ever mixed client-side.
    if (itemType === "lostfound" && filters.status) {
      filteredItems = filteredItems.filter(
        (item) => item.status === filters.status
      );
    }

    // 5. Sorting
    // The `sort` method mutates the array, so it's applied to `filteredItems`.
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
        if (itemType === "sell") { // Price sorting only for 'sell' items.
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
        // No sorting or default sorting already applied (e.g., by "newest" if it's the default).
        break;
    }
    return filteredItems; // Return the processed list.
  }, [items, filters, globalSearchTerm, itemType]); // Dependencies for `useMemo`.
};