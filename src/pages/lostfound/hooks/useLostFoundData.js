// This custom React hook encapsulates the business logic and state management
// for the Lost & Found section. It handles fetching lost or found items based on status,
// filtering, sorting, and CRUD operations for these items.

import { useState, useEffect, useCallback, useMemo } from "react";
// Firebase imports for database interactions.
import {
  db,
  appId, // Used for namespacing Firestore collection paths.
} from "../../../firebase.jsx";
import {
  collection,
  query,
  where, // For filtering by status (lost/found).
  orderBy, // For sorting items by date or other criteria.
  onSnapshot, // For real-time updates.
  doc,
  addDoc,
  setDoc, // Can be used for updates (with merge:true).
  deleteDoc,
  serverTimestamp, // For server-generated timestamps.
  // Timestamp, // Not explicitly used here but often useful for date conversions.
} from "firebase/firestore";
// Constants specific to the lost & found feature (categories, status options).
import // LOSTFOUND_CATEGORIES, // These are often imported directly in the component.
// STATUS_OPTIONS,
// DEFAULT_LOSTFOUND_FILTERS // If defined for default filter state.
"./lostFoundConstants.js";
// Example: import { someHelperFunction } from '../../../utils/helpers.js';

/**
 * Custom hook for managing Lost & Found data and operations.
 *
 * @param {object|null} user - The currently authenticated user object.
 * @param {Function} showMessage - Callback function to display global messages.
 * @param {string} [globalSearchTerm=""] - The global search term from the application header.
 * @returns {object} An object containing state and functions for the Lost & Found section.
 */
const useLostFoundData = (user, showMessage, globalSearchTerm = "") => {
  // State for all items matching the current 'status' filter (e.g., all 'lost' items).
  const [items, setItems] = useState([]);
  // Loading state for data fetching.
  const [loading, setLoading] = useState(true);
  // Local filters: category, sort order, and status (lost/found).
  const [filters, setFilters] = useState({
    category: "",
    sortBy: "newest",
    status: "lost", // Default to showing 'lost' items.
  });

  // State for modal visibility and item being edited.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  // State to indicate if the item form (add/edit) is processing.
  const [isFormProcessing, setIsFormProcessing] = useState(false);
  // State for ongoing operations like delete.
  const [operationInProgress, setOperationInProgress] = useState(false);

  // Firestore collection path for lost & found items.
  const itemsCollectionPath = `artifacts/${appId}/public/data/lostfound_items`;

  // Effect to fetch Lost & Found items based on the current `filters.status` (lost/found) and `filters.sortBy`.
  // Uses onSnapshot for real-time updates.
  useEffect(() => {
    setLoading(true);
    const itemsRef = collection(db, itemsCollectionPath);
    // Primary query constraint: filter by status ('lost' or 'found').
    let q = query(itemsRef, where("status", "==", filters.status));

    // Add sorting. Firestore requires an index for compound queries (e.g., status + createdAt).
    q = query(
      q,
      orderBy("createdAt", filters.sortBy === "oldest" ? "asc" : "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const itemsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(itemsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching L&F items in useLostFoundData: ", error);
        showMessage?.(
          `Error fetching items: ${error.message}. Please try again.`,
          "error"
        );
        setLoading(false);
      }
    );

    // Cleanup: unsubscribe from the listener when dependencies change or component unmounts.
    return () => unsubscribe();
  }, [filters.status, filters.sortBy, itemsCollectionPath, showMessage]); // Re-fetch if status or sort order changes.

  // Callback to handle changes in local filters (category, sortBy, status).
  const handleFilterChange = useCallback((newFilterValues) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilterValues,
    }));
  }, []);

  // Memoized derivation of items after applying global search and client-side category/sort filters.
  // The primary status filter is handled by the Firestore query.
  const processedItems = useMemo(() => {
    let filtered = [...items]; // Start with items fetched for the current status.

    // Apply global search term (client-side).
    if (globalSearchTerm) {
      const term = globalSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.category?.toLowerCase().includes(term) ||
          item.lastSeenLocation?.toLowerCase().includes(term) // Specific to L&F.
      );
    }

    // Apply category filter (client-side).
    if (filters.category && filters.category !== "All") {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    // Apply additional client-side sorting if needed (e.g., alphabetical).
    // The initial Firestore query already handles date-based sorting.
    if (filters.sortBy === "alphabetical") {
      filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return filtered;
  }, [items, globalSearchTerm, filters.category, filters.sortBy]);

  // --- Modal and Editing Logic ---
  const openAddModal = useCallback(() => {
    setEditingItem(null); // Ensure form is for a new item.
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((item) => {
    setEditingItem(item); // Set item data for editing.
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (!isFormProcessing) {
      // Prevent closing if form is busy.
      setIsModalOpen(false);
      setEditingItem(null);
    }
  }, [isFormProcessing]);

  // --- Item CRUD Operations ---

  /**
   * Handles submission of the Lost & Found item form (add/edit).
   * @param {object} itemDataFromForm - Data from the ItemForm component.
   * @throws {Error} If user is not logged in or submission fails.
   */
  const handleSubmitItem = useCallback(
    async (itemDataFromForm) => {
      if (!user) {
        showMessage?.("Please log in to post or update items.", "info");
        throw new Error("User not logged in");
      }
      // ItemForm can manage its own `isFormProcessing` state via the `onFormProcessing` callback.

      // Prepare base data for Firestore.
      const baseData = {
        ...itemDataFromForm,
        // Preserve original userId on edit, set current user's ID for new items.
        userId: editingItem ? editingItem.userId : user.uid,
        userEmail: editingItem ? editingItem.userEmail : user.email,
        userDisplayName: editingItem
          ? editingItem.userDisplayName
          : user.displayName || null,
        updatedAt: serverTimestamp(), // Set/update server timestamp.
      };

      if (!editingItem) {
        // For new items.
        baseData.createdAt = serverTimestamp();
        // The `status` ('lost' or 'found') should be set by ItemForm based on its logic
        // (e.g., presence of `dateFound` might imply 'found').
      }

      try {
        if (editingItem?.id) {
          // --- EDIT Operation ---
          const docRef = doc(db, itemsCollectionPath, editingItem.id);
          // Use setDoc with merge:true for robust updates, or updateDoc for partial.
          await setDoc(docRef, baseData, { merge: true });
          showMessage?.("Post updated successfully!", "success");
        } else {
          // --- ADD Operation ---
          await addDoc(collection(db, itemsCollectionPath), baseData);
          showMessage?.("Post added successfully!", "success");
        }
        closeModal(); // Close modal on success.
      } catch (error) {
        console.error("Error saving L&F item in useLostFoundData: ", error);
        showMessage?.(`Error saving post: ${error.message}`, "error");
        throw error; // Re-throw for form to handle if needed.
      }
    },
    [user, editingItem, itemsCollectionPath, closeModal, showMessage]
  );

  /**
   * Handles deletion of a Lost & Found item.
   * @param {string} itemId - The ID of the item to delete.
   */
  const handleDeleteItem = useCallback(
    async (itemId) => {
      if (!user) {
        showMessage?.("Please log in to delete posts.", "info");
        return;
      }
      // Confirmation dialog should be implemented in the component calling this.
      setOperationInProgress(true);
      try {
        await deleteDoc(doc(db, itemsCollectionPath, itemId));
        showMessage?.("Post deleted successfully!", "success");
        // Note: Image deletion from Firebase Storage would also be handled here
        // if Lost & Found items had images, similar to the selling section.
      } catch (error) {
        console.error("Error deleting L&F post in useLostFoundData: ", error);
        showMessage?.(`Error deleting post: ${error.message}`, "error");
      } finally {
        setOperationInProgress(false);
      }
    },
    [user, itemsCollectionPath, showMessage]
  );

  // Return state and functions for the LostAndFoundSection component.
  return {
    items, // Raw items for the current status filter.
    loading,
    filters,
    setFilters: handleFilterChange, // Function to update local filters.
    processedItems, // Items after all client-side filtering and sorting.
    isModalOpen,
    editingItem,
    // isFormProcessing, // ItemForm controls this via setIsFormProcessing.
    setIsFormProcessing,
    operationInProgress,
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmitItem,
    handleDeleteItem,
    // Constants like LOSTFOUND_CATEGORIES can be imported directly by the section component.
  };
};

export default useLostFoundData;
