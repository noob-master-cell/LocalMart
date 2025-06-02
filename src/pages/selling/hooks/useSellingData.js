// src/pages/selling/hooks/useSellingData.js

import { useState, useEffect, useCallback, useMemo } from "react";
import { db, appId, auth } from "../../../firebase.jsx"; // Adjust path if firebase.jsx is elsewhere
import firebaseService from "../../../services/firebaseService.js"; // Adjust path if needed
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { validateImageFile, validateWhatsApp } from "../../../utils/helpers.js";
// The hook will likely need the current user and a way to show messages
const useSellingData = (user, showMessage, globalSearchTerm = "") => {
  const type = "sell"; // Define type for this hook

  const [userItems, setUserItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    sortBy: "newest",
    priceRange: { min: "", max: "" },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isFormProcessing, setIsFormProcessing] = useState(false);
  const [operationInProgress, setOperationInProgress] = useState(false);

  const itemsCollectionPath = `artifacts/${appId}/public/data/sell_items`;
  // Fetch User's Items
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      setUserItems([]);
      return () => {}; // No-op cleanup
    }

    setLoading(true);
    const q = query(
      collection(db, itemsCollectionPath),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const itemsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Default sort by newest if not otherwise specified by filters
        itemsData.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
        setUserItems(itemsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user items in useSellingData: ", error);
        showMessage?.(`Error fetching your items: ${error.message}`, "error");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user?.uid, itemsCollectionPath, showMessage]); // showMessage added as a dependency

  // Handle Filter Changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
      priceRange: newFilters.priceRange || { min: "", max: "" },
    }));
  }, []);

  // Processed (Filtered and Sorted) Items
  const processedItems = useMemo(() => {
    let filtered = [...userItems]; // Create a new array

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
      if (filters.priceRange.min) {
        filtered = filtered.filter(
          (item) => item.price >= parseFloat(filters.priceRange.min)
        );
      }
      if (filters.priceRange.max) {
        filtered = filtered.filter(
          (item) => item.price <= parseFloat(filters.priceRange.max)
        );
      }
    }

    // Apply sort
    switch (filters.sortBy) {
      case "newest":
        // Already sorted by newest in useEffect, but explicit sort ensures consistency if data changes
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
        break;
    }
    return filtered;
  }, [userItems, globalSearchTerm, filters]);

  // Modal and Editing Logic
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
      // Only close if form is not busy
      setIsModalOpen(false);
      setEditingItem(null);
    }
  }, [isFormProcessing]);

  const handleSubmitItem = useCallback(
    async (
      formDataFromForm,
      newImageFiles = [],
      removedInitialImagePaths = []
    ) => {
      if (!user) {
        showMessage?.("User not logged in.", "error");
        throw new Error("User not logged in");
      }

      const { status, ...baseFormData } = formDataFromForm;

      try {
        let finalImageUrls = [];
        let finalImageStoragePaths = [];

        if (editingItem?.id && editingItem.imageUrls) {
          editingItem.imageUrls.forEach((url, index) => {
            const path = editingItem.imageStoragePaths?.[index];
            if (path && !removedInitialImagePaths.includes(path)) {
              finalImageUrls.push(url);
              finalImageStoragePaths.push(path);
            } else if (
              !path &&
              !removedInitialImagePaths.some((removedPath) =>
                url.includes(removedPath)
              )
            ) {
              finalImageUrls.push(url);
            }
          });
        }

        if (newImageFiles.length > 0) {
          showMessage?.("Uploading new images...", "info", {
            autoDismiss: false,
          });
          // 'type' is now defined as "sell" within this hook's scope
          const uploadResults = await firebaseService.uploadMultipleImages(
            newImageFiles,
            type
          );
          if (uploadResults.failed.length > 0) {
            const failedFileNames = uploadResults.failed
              .map((f) => f.file)
              .join(", ");
            throw new Error(
              `Some new images failed to upload: ${failedFileNames}`
            );
          }
          uploadResults.successful.forEach((res) => {
            finalImageUrls.push(res.url);
            finalImageStoragePaths.push(res.path);
          });
        }

        const currentUser = auth.currentUser; // auth should be imported from firebase.jsx
        const whatsappValidation = validateWhatsApp(
          baseFormData.whatsappNumber
        );

        const itemDataPayload = {
          ...baseFormData,
          whatsappNumber: whatsappValidation.cleanNumber,
          imageUrls: finalImageUrls,
          imageStoragePaths: finalImageStoragePaths,
          updatedAt: serverTimestamp(), // serverTimestamp should be imported
        };

        // Price is specific to "sell" type, this condition will always be true here
        if (itemDataPayload.price !== undefined) {
          itemDataPayload.price = parseFloat(itemDataPayload.price) || 0;
        }

        if (editingItem?.id) {
          // EDIT Operation
          const docRef = doc(db, itemsCollectionPath, editingItem.id);
          await updateDoc(docRef, itemDataPayload);

          if (removedInitialImagePaths.length > 0) {
            showMessage?.("Removing old images...", "info", {
              autoDismiss: false,
            });
            const deletePromises = removedInitialImagePaths.map((path) =>
              firebaseService.deleteImage(path).catch((err) => {
                console.warn(`Failed to delete old image ${path}:`, err);
                showMessage?.(`Could not delete an old image.`, "warning");
              })
            );
            await Promise.all(deletePromises);
          }
          showMessage?.("Item updated successfully!", "success");
        } else {
          // ADD Operation
          itemDataPayload.userId = user.uid;
          itemDataPayload.userEmail = currentUser?.email;
          itemDataPayload.userDisplayName = currentUser?.displayName || null;
          itemDataPayload.createdAt = serverTimestamp();

          await addDoc(collection(db, itemsCollectionPath), itemDataPayload);
          showMessage?.("Item added successfully!", "success");
        }
        closeModal();
      } catch (error) {
        console.error("Error saving item in useSellingData: ", error);
        showMessage?.(`Submission failed: ${error.message}`, "error");
        throw error;
      }
    },
    // 'type' is removed from here as it's a constant within the hook
    [user, editingItem, itemsCollectionPath, closeModal, showMessage]
  );

  const handleDeleteItem = useCallback(
    async (itemId) => {
      if (!user) {
        showMessage?.("Please log in to delete items.", "info");
        return;
      }
      if (!itemId) {
        showMessage?.("Error: Invalid item ID", "error");
        return;
      }
      if (operationInProgress) {
        showMessage?.(
          "Another operation is in progress. Please wait.",
          "warning"
        );
        return;
      }

      const confirmDelete = window.confirm(
        "Are you sure you want to delete this item and its images permanently?"
      );
      if (!confirmDelete) return;

      setOperationInProgress(true);
      try {
        const itemDocRef = doc(db, itemsCollectionPath, itemId);
        const itemSnap = await getDoc(itemDocRef); // getDoc needs to be imported
        let pathsToDelete = [];

        if (itemSnap.exists()) {
          pathsToDelete = itemSnap.data().imageStoragePaths || [];
        }

        await deleteDoc(itemDocRef);

        if (pathsToDelete.length > 0) {
          showMessage?.("Deleting associated images...", "info", {
            autoDismiss: false,
          });
          const deleteImagePromises = pathsToDelete.map((path) =>
            firebaseService.deleteImage(path).catch((err) => {
              console.warn(
                `Failed to delete image ${path} during item deletion:`,
                err
              );
            })
          );
          await Promise.all(deleteImagePromises);
        }
        showMessage?.("Item deleted successfully!", "success");
      } catch (error) {
        console.error("Delete operation failed in useSellingData:", error);
        showMessage?.(`Failed to delete item: ${error.message}`, "error");
      } finally {
        setOperationInProgress(false);
      }
    },
    [user, itemsCollectionPath, operationInProgress, showMessage]
  );

  const handleClearSearch = useCallback(() => {
    // This hook primarily manages user's items, global search is a prop.
    // Clearing local filters if needed:
    // setFilters(DEFAULT_SELLING_FILTERS || { category: '', sortBy: 'newest', priceRange: { min: '', max: '' } });
    // The parent (SellingSection) will handle clearing the globalSearchTerm prop.
  }, []);

  // Return state and functions
  return {
    userItems, // Raw list of user's items
    loading,
    filters,
    setFilters: handleFilterChange, // Expose setFilters directly or via a handler
    processedItems, // Filtered and sorted items
    isModalOpen,
    editingItem,
    setEditingItem, // Allow SellingSection to set this if needed externally
    isFormProcessing,
    setIsFormProcessing, // Allow ItemForm to control this
    operationInProgress,
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmitItem,
    handleDeleteItem,
    handleClearSearch, // May or may not be used depending on where global search is cleared
    // sellingCategories: SELLING_CATEGORIES, // SellingSection can import this directly
  };
};

export default useSellingData;
