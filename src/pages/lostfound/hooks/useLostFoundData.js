// src/pages/lostfound/hooks/useLostFoundData.js

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  db,
  appId, // Assuming appId is used for collection paths
} from "../../../firebase.jsx"; // Adjust path as necessary
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  setDoc, // For updates, or updateDoc
  deleteDoc,
  serverTimestamp, // If you use server timestamps for createdAt/updatedAt
  Timestamp, // If you're converting dates for queries or display prep
} from "firebase/firestore";
import {
  LOSTFOUND_CATEGORIES,
  STATUS_OPTIONS,
  // DEFAULT_LOSTFOUND_FILTERS // If you define this
} from "./lostFoundConstants.js";
// import { someHelperFunction } from '../../../utils/helpers.js';

const useLostFoundData = (user, showMessage, globalSearchTerm = "") => {
  const [items, setItems] = useState([]); // All items for the current status (lost/found)
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    sortBy: "newest",
    status: "lost", // Default to 'lost'
    // No priceRange for lost & found
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isFormProcessing, setIsFormProcessing] = useState(false);
  const [operationInProgress, setOperationInProgress] = useState(false); // e.g., for delete

  const itemsCollectionPath = `artifacts/${appId}/public/data/lostfound_items`;

  // Fetch Lost & Found Items based on current filter.status
  useEffect(() => {
    setLoading(true);
    const itemsRef = collection(db, itemsCollectionPath);
    // Main query constraint: filter by status ('lost' or 'found')
    let q = query(itemsRef, where("status", "==", filters.status));

    // Add sorting (default by newest)
    // Note: Firestore requires an index for most compound queries (e.g., status + createdAt)
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

    return () => unsubscribe();
  }, [filters.status, filters.sortBy, itemsCollectionPath, showMessage]); // Re-fetch if status or sort order changes

  // Handle Filter Changes (category, sortBy, status)
  const handleFilterChange = useCallback((newFilterValues) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilterValues,
    }));
  }, []);

  // Processed (Filtered and Sorted client-side after initial fetch by status)
  const processedItems = useMemo(() => {
    let filtered = [...items];

    // Apply global search term
    if (globalSearchTerm) {
      const term = globalSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.category?.toLowerCase().includes(term) ||
          item.lastSeenLocation?.toLowerCase().includes(term)
      );
    }

    // Apply category filter (client-side, as status is the primary DB query filter)
    if (filters.category && filters.category !== "All") {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    // Client-side sorting if sortBy changes in a way not handled by the initial query
    // (e.g., alphabetical). The initial query already sorts by date.
    if (filters.sortBy === "alphabetical") {
      filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    // If initial query sorts by 'createdAt desc' (newest) or 'createdAt asc' (oldest),
    // no further client-side date sorting is strictly needed unless items are added/modified client-side
    // without re-triggering the onSnapshot with new sorting.
    // The onSnapshot should re-evaluate with new orderBy if filters.sortBy (for date) changes.

    return filtered;
  }, [items, globalSearchTerm, filters.category, filters.sortBy]);

  // Modal and Editing Logic
  const openAddModal = useCallback(() => {
    setEditingItem(null); // Ensure it's a new item
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (!isFormProcessing) {
      setIsModalOpen(false);
      setEditingItem(null);
    }
  }, [isFormProcessing]);

  // Item CRUD Operations
  const handleSubmitItem = useCallback(
    async (itemDataFromForm) => {
      if (!user) {
        showMessage?.("Please log in to post or update items.", "info");
        throw new Error("User not logged in");
      }
      // setIsFormProcessing(true); // Let ItemForm manage its own busy state via onFormProcessing

      // Ensure basic fields and userId for new items
      const baseData = {
        ...itemDataFromForm,
        userId: editingItem ? editingItem.userId : user.uid, // Keep original userId on edit
        userEmail: editingItem ? editingItem.userEmail : user.email,
        userDisplayName: editingItem
          ? editingItem.userDisplayName
          : user.displayName || null,
        updatedAt: serverTimestamp(),
      };

      if (!editingItem) {
        // New item
        baseData.createdAt = serverTimestamp();
        // Status for new item should be derived from the form or current filter context
        // ItemForm will set status: 'lost' or 'found' based on dateFound
      }

      try {
        if (editingItem?.id) {
          const docRef = doc(db, itemsCollectionPath, editingItem.id);
          // For setDoc with merge: true, or updateDoc
          await setDoc(docRef, baseData, { merge: true }); // Or updateDoc for partial updates
          showMessage?.("Post updated successfully!", "success");
        } else {
          await addDoc(collection(db, itemsCollectionPath), baseData);
          showMessage?.("Post added successfully!", "success");
        }
        closeModal();
      } catch (error) {
        console.error("Error saving L&F item in useLostFoundData: ", error);
        showMessage?.(`Error saving post: ${error.message}`, "error");
        throw error;
      } finally {
        // setIsFormProcessing(false);
      }
    },
    [user, editingItem, itemsCollectionPath, closeModal, showMessage]
  );

  const handleDeleteItem = useCallback(
    async (itemId) => {
      if (!user) {
        showMessage?.("Please log in to delete posts.", "info");
        return;
      }
      // Add confirmation dialog here in a real app
      setOperationInProgress(true);
      try {
        await deleteDoc(doc(db, itemsCollectionPath, itemId));
        showMessage?.("Post deleted successfully!", "success");
        // Note: Image deletion from storage would also be handled here if images are associated.
      } catch (error) {
        console.error("Error deleting L&F post in useLostFoundData: ", error);
        showMessage?.(`Error deleting post: ${error.message}`, "error");
      } finally {
        setOperationInProgress(false);
      }
    },
    [user, itemsCollectionPath, showMessage]
  );

  // Return state and functions
  return {
    items, // Raw items for the current status
    loading,
    filters,
    setFilters: handleFilterChange, // Expose filter update mechanism
    processedItems, // Client-side filtered/sorted items
    isModalOpen,
    editingItem,
    isFormProcessing,
    setIsFormProcessing, // To be controlled by ItemForm via LostAndFoundSection
    operationInProgress,
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmitItem,
    handleDeleteItem,
    // lostFoundCategories: LOSTFOUND_CATEGORIES, // Section can import directly
    // statusOptions: STATUS_OPTIONS, // Section can import directly
  };
};

export default useLostFoundData;
