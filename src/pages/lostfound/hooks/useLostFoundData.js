// src/pages/lostfound/hooks/useLostFoundData.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { db, appId, auth } from "../../../firebase.jsx";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Custom hook for managing Lost & Found data and operations.
 * Updated to properly handle display names when creating items.
 */
const useLostFoundData = (user, showMessage, globalSearchTerm = "") => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    sortBy: "newest",
    status: "lost",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isFormProcessing, setIsFormProcessing] = useState(false);
  const [operationInProgress, setOperationInProgress] = useState(false);

  const itemsCollectionPath = `artifacts/${appId}/public/data/lostfound_items`;

  useEffect(() => {
    setLoading(true);
    const itemsRef = collection(db, itemsCollectionPath);
    let q = query(itemsRef, where("status", "==", filters.status));

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
  }, [filters.status, filters.sortBy, itemsCollectionPath, showMessage]);

  const handleFilterChange = useCallback((newFilterValues) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilterValues,
    }));
  }, []);

  const processedItems = useMemo(() => {
    let filtered = [...items];

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

    if (filters.category && filters.category !== "All") {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    if (filters.sortBy === "alphabetical") {
      filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return filtered;
  }, [items, globalSearchTerm, filters.category, filters.sortBy]);

  const openAddModal = useCallback(() => {
    setEditingItem(null);
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

  /**
   * Handles submission of the Lost & Found item form (add/edit).
   * Now ensures proper display name is saved.
   */
  const handleSubmitItem = useCallback(
    async (itemDataFromForm) => {
      if (!user) {
        showMessage?.("Please log in to post or update items.", "info");
        throw new Error("User not logged in");
      }

      const currentUser = auth.currentUser;

      // Get the most current display name - prioritize Firebase Auth displayName
      const getUserDisplayName = () => {
        if (currentUser?.displayName && currentUser.displayName.trim()) {
          return currentUser.displayName.trim();
        }
        if (user.displayName && user.displayName.trim()) {
          return user.displayName.trim();
        }
        // Fallback to email if no display name is available
        if (currentUser?.email) {
          const emailName = currentUser.email.split("@")[0];
          return emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
        return null;
      };

      const baseData = {
        ...itemDataFromForm,
        userId: editingItem ? editingItem.userId : user.uid,
        userEmail: editingItem ? editingItem.userEmail : currentUser?.email,
        userDisplayName: editingItem
          ? editingItem.userDisplayName
          : getUserDisplayName(),
        updatedAt: serverTimestamp(),
      };

      if (!editingItem) {
        baseData.createdAt = serverTimestamp();
      }

      try {
        if (editingItem?.id) {
          // --- EDIT Operation ---
          const docRef = doc(db, itemsCollectionPath, editingItem.id);
          await setDoc(docRef, baseData, { merge: true });
          showMessage?.("Post updated successfully!", "success");
        } else {
          // --- ADD Operation ---
          await addDoc(collection(db, itemsCollectionPath), baseData);
          showMessage?.("Post added successfully!", "success");
        }
        closeModal();
      } catch (error) {
        console.error("Error saving L&F item in useLostFoundData: ", error);
        showMessage?.(`Error saving post: ${error.message}`, "error");
        throw error;
      }
    },
    [user, editingItem, itemsCollectionPath, closeModal, showMessage]
  );

  /**
   * Handles deletion of a Lost & Found item.
   */
  const handleDeleteItem = useCallback(
    async (itemId) => {
      if (!user) {
        showMessage?.("Please log in to delete posts.", "info");
        return;
      }

      if (!window.confirm("Are you sure you want to delete this post?")) {
        return;
      }

      setOperationInProgress(true);
      try {
        await deleteDoc(doc(db, itemsCollectionPath, itemId));
        showMessage?.("Post deleted successfully!", "success");
      } catch (error) {
        console.error("Error deleting L&F post in useLostFoundData: ", error);
        showMessage?.(`Error deleting post: ${error.message}`, "error");
      } finally {
        setOperationInProgress(false);
      }
    },
    [user, itemsCollectionPath, showMessage]
  );

  return {
    items,
    loading,
    filters,
    setFilters: handleFilterChange,
    processedItems,
    isModalOpen,
    editingItem,
    setIsFormProcessing,
    operationInProgress,
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmitItem,
    handleDeleteItem,
  };
};

export default useLostFoundData;
