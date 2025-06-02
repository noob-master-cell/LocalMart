// This custom React hook encapsulates the business logic and state management
// for the "User's Items for Sale" (Selling) section. It handles fetching user-specific items,
// filtering, sorting, and CRUD operations (Create, Read, Update, Delete) for these items.

import { useState, useEffect, useCallback, useMemo } from "react";
// Firebase imports for database interactions and authentication context.
import { db, appId, auth } from "../../../firebase.jsx";
import firebaseService from "../../../services/firebaseService.js"; // Centralized Firebase service.
import {
  collection,
  query,
  where,
  onSnapshot, // For real-time updates.
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp, // For server-generated timestamps.
  getDoc,
} from "firebase/firestore";
// Utility functions for validations.
import { validateWhatsApp } from "../../../utils/helpers.js";

/**
 * Custom hook for managing selling data and operations.
 *
 * @param {object|null} user - The currently authenticated user object from Firebase Auth.
 * @param {Function} showMessage - Callback function to display global messages/notifications.
 * @param {string} [globalSearchTerm=""] - The global search term from the application header.
 * @returns {object} An object containing state and functions for the selling section.
 */
const useSellingData = (user, showMessage, globalSearchTerm = "") => {
  // Type identifier for this section, used in operations like image uploads.
  const type = "sell";

  // State for storing the raw list of items owned by the user.
  const [userItems, setUserItems] = useState([]);
  // Loading state for data fetching operations.
  const [loading, setLoading] = useState(true);
  // Local filters applied to the user's items (category, sort order, price range).
  const [filters, setFilters] = useState({
    category: "",
    sortBy: "newest",
    priceRange: { min: "", max: "" },
  });
  // State to control the visibility of the add/edit item modal.
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to hold the item currently being edited (null if adding a new item).
  const [editingItem, setEditingItem] = useState(null);
  // State to indicate if the item form (add/edit) is currently processing a submission.
  const [isFormProcessing, setIsFormProcessing] = useState(false);
  // State to prevent concurrent delete or other critical operations.
  const [operationInProgress, setOperationInProgress] = useState(false);

  // Firestore collection path for sell items.
  const itemsCollectionPath = `artifacts/${appId}/public/data/sell_items`;

  // Effect to fetch user's items when the user ID changes.
  // Uses onSnapshot for real-time updates.
  useEffect(() => {
    // If no user is logged in, clear items and stop loading.
    if (!user?.uid) {
      setLoading(false);
      setUserItems([]);
      return () => {}; // Return a no-op cleanup function.
    }

    setLoading(true);
    // Query for items where 'userId' matches the current user's UID.
    const q = query(
      collection(db, itemsCollectionPath),
      where("userId", "==", user.uid)
    );

    // Subscribe to real-time updates.
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const itemsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Default sort by newest after fetching.
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
    // Cleanup function to unsubscribe from the listener when the component unmounts or dependencies change.
    return () => unsubscribe();
  }, [user?.uid, itemsCollectionPath, showMessage]);

  // Callback to handle changes in local filters.
  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
      // Ensure priceRange is always an object.
      priceRange: newFilters.priceRange || prevFilters.priceRange || { min: "", max: "" },
    }));
  }, []);

  // Memoized derivation of items after applying global search and local filters/sorting.
  const processedItems = useMemo(() => {
    let filtered = [...userItems]; // Start with a copy of user's items.

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
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    // Apply price range filter.
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

    // Apply sorting.
    switch (filters.sortBy) {
      case "newest":
        filtered.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        break;
      case "oldest":
        filtered.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
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

  // --- Modal and Editing Logic ---

  const openAddModal = useCallback(() => {
    setEditingItem(null); // Clear any existing editing item.
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((item) => {
    setEditingItem(item); // Set the item to be edited.
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    // Only close if the form is not currently processing.
    if (!isFormProcessing) {
      setIsModalOpen(false);
      setEditingItem(null);
    }
  }, [isFormProcessing]);

  // --- Item CRUD Operations ---

  /**
   * Handles submission of the item form (both add and edit).
   * Manages image uploads and data persistence to Firestore.
   *
   * @param {object} formDataFromForm - The item data from the form.
   * @param {File[]} [newImageFiles=[]] - Array of new image files to upload.
   * @param {string[]} [removedInitialImagePaths=[]] - Array of storage paths for initial images to be deleted.
   * @throws {Error} If user is not logged in or submission fails.
   */
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

      // Destructure status if present, as it's not directly used for 'sell' items here.
      const { status, ...baseFormData } = formDataFromForm;

      try {
        let finalImageUrls = []; // URLs of images to be stored in Firestore.
        let finalImageStoragePaths = []; // Storage paths for these images.

        // Preserve existing images if editing and not marked for removal.
        if (editingItem?.id && editingItem.imageUrls) {
          editingItem.imageUrls.forEach((url, index) => {
            const path = editingItem.imageStoragePaths?.[index];
            if (path && !removedInitialImagePaths.includes(path)) {
              finalImageUrls.push(url);
              finalImageStoragePaths.push(path);
            } else if ( // Handle older items that might not have storage paths stored.
              !path &&
              !removedInitialImagePaths.some((removedPath) => url.includes(removedPath))
            ) {
              finalImageUrls.push(url);
              // No storage path to add for these.
            }
          });
        }

        // Upload new images if any.
        if (newImageFiles.length > 0) {
          showMessage?.("Uploading new images...", "info", { autoDismiss: false });
          // Use firebaseService for image uploads. 'type' is "sell".
          const uploadResults = await firebaseService.uploadMultipleImages(
            newImageFiles,
            type // 'type' is "sell"
          );
          if (uploadResults.failed.length > 0) {
            const failedFileNames = uploadResults.failed.map((f) => f.file).join(", ");
            throw new Error(`Some new images failed to upload: ${failedFileNames}`);
          }
          uploadResults.successful.forEach((res) => {
            finalImageUrls.push(res.url);
            finalImageStoragePaths.push(res.path);
          });
        }

        const currentUser = auth.currentUser; // Get current Firebase Auth user.
        // Validate and clean WhatsApp number.
        const whatsappValidation = validateWhatsApp(baseFormData.whatsappNumber);

        const itemDataPayload = {
          ...baseFormData,
          whatsappNumber: whatsappValidation.cleanNumber,
          imageUrls: finalImageUrls,
          imageStoragePaths: finalImageStoragePaths,
          updatedAt: serverTimestamp(), // Use server timestamp for updates.
        };

        // Ensure price is a number for "sell" items.
        if (itemDataPayload.price !== undefined) {
          itemDataPayload.price = parseFloat(itemDataPayload.price) || 0;
        }

        if (editingItem?.id) {
          // --- EDIT Operation ---
          const docRef = doc(db, itemsCollectionPath, editingItem.id);
          await updateDoc(docRef, itemDataPayload);

          // Delete old images that were removed by the user.
          if (removedInitialImagePaths.length > 0) {
            showMessage?.("Removing old images...", "info", { autoDismiss: false });
            const deletePromises = removedInitialImagePaths.map((path) =>
              firebaseService.deleteImage(path).catch((err) => {
                console.warn(`Failed to delete old image ${path}:`, err);
                showMessage?.(`Could not delete an old image: ${path.split('/').pop()}`, "warning");
              })
            );
            await Promise.all(deletePromises);
          }
          showMessage?.("Item updated successfully!", "success");
        } else {
          // --- ADD Operation ---
          itemDataPayload.userId = user.uid;
          itemDataPayload.userEmail = currentUser?.email;
          itemDataPayload.userDisplayName = currentUser?.displayName || null;
          itemDataPayload.createdAt = serverTimestamp(); // Set creation timestamp.

          await addDoc(collection(db, itemsCollectionPath), itemDataPayload);
          showMessage?.("Item added successfully!", "success");
        }
        closeModal(); // Close modal on successful submission.
      } catch (error) {
        console.error("Error saving item in useSellingData: ", error);
        showMessage?.(`Submission failed: ${error.message}`, "error");
        throw error; // Re-throw to be caught by the form if needed.
      }
    },
    [user, editingItem, itemsCollectionPath, closeModal, showMessage, type]
  );

  /**
   * Handles deletion of an item, including its associated images from Firebase Storage.
   * @param {string} itemId - The ID of the item to delete.
   */
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
      if (operationInProgress) { // Prevent concurrent operations.
        showMessage?.("Another operation is in progress. Please wait.", "warning");
        return;
      }

      // Confirm deletion with the user.
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this item and its images permanently?"
      );
      if (!confirmDelete) return;

      setOperationInProgress(true);
      try {
        const itemDocRef = doc(db, itemsCollectionPath, itemId);
        const itemSnap = await getDoc(itemDocRef); // Fetch item to get image paths.
        let pathsToDelete = [];

        if (itemSnap.exists()) {
          pathsToDelete = itemSnap.data().imageStoragePaths || [];
        }

        // Delete item document from Firestore.
        await deleteDoc(itemDocRef);

        // Delete associated images from Firebase Storage.
        if (pathsToDelete.length > 0) {
          showMessage?.("Deleting associated images...", "info", { autoDismiss: false });
          const deleteImagePromises = pathsToDelete.map((path) =>
            firebaseService.deleteImage(path).catch((err) => {
              console.warn(`Failed to delete image ${path} during item deletion:`, err);
              // Optionally inform user about individual image deletion failures.
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

  // Placeholder for clearing search (global search clear is handled by parent).
  const handleClearSearch = useCallback(() => {
    // This hook primarily manages user's items.
    // If local filters should also be cleared when global search is cleared,
    // this logic could be expanded or handled by the parent component.
  }, []);

  // Return state and functions to be used by the SellingSection component.
  return {
    userItems,          // Raw list of user's items.
    loading,            // Loading state.
    filters,            // Current local filters.
    setFilters: handleFilterChange, // Function to update local filters.
    processedItems,     // Items after filtering and sorting.
    isModalOpen,        // Modal visibility state.
    editingItem,        // Item being edited.
    setEditingItem,     // Allow parent to set editing item if needed.
    isFormProcessing,
    setIsFormProcessing,// Allow ItemForm to control its busy state.
    operationInProgress, // Deletion operation status.
    openAddModal,
    openEditModal,
    closeModal,
    handleSubmitItem,
    handleDeleteItem,
    handleClearSearch,
  };
};

export default useSellingData;