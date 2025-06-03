// src/services/firebaseService.js
import ImageService from "./imageService"; // Assuming it's in the same directory
import FirestoreService from "./firestoreService"; // Assuming it's in the same directory
import { Timestamp } from "../firebase"; // Import Timestamp if needed for any direct pass-through

class FirebaseService {
  constructor() {
    this.imageService = ImageService; // Use the imported singleton instance
    this.firestoreService = FirestoreService; // Use the imported singleton instance

    // Re-expose collection paths if they were directly accessed from the old service
    this.collections = this.firestoreService.collections;
  }

  // --- Cache Management Methods ---
  // These are now part of FirestoreService, but if your old API exposed them,
  // you can choose to proxy them or have consumers use FirestoreService directly for these.
  // For simplicity, we'll assume direct usage or that they were internal.
  // If needed, you could add:
  // _getCacheKey(collectionPath, filters = {}) { return this.firestoreService._getCacheKey(collectionPath, filters); }
  // invalidateCollectionCache(collectionPath) { this.firestoreService.invalidateCollectionCache(collectionPath); }

  // --- Connection Pooling Methods ---
  // Similar to cache, likely internal to FirestoreService now.

  // --- Image Operations (Delegated to ImageService) ---
  async uploadImage(file, itemContextPath, options = {}) {
    return this.imageService.uploadImage(file, itemContextPath, options);
  }

  async uploadMultipleImages(files, itemContextPath, onProgress) {
    return this.imageService.uploadMultipleImages(
      files,
      itemContextPath,
      onProgress
    );
  }

  async deleteImage(imagePath) {
    return this.imageService.deleteImage(imagePath);
  }

  // --- Firestore CRUD Operations (Delegated to FirestoreService) ---
  async addItem(collectionPath, data) {
    // Ensure createdAt and updatedAt are handled correctly or passed as Firestore Timestamps
    const dataWithTimestamps = {
      ...data,
      createdAt:
        data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    return this.firestoreService.addItem(collectionPath, dataWithTimestamps);
  }

  async updateItem(collectionPath, docId, updates) {
    return this.firestoreService.updateItem(collectionPath, docId, updates);
  }

  /**
   * Deletes an item (document) from a Firestore collection AND its associated images from Storage.
   * This method now orchestrates calls to both FirestoreService and ImageService.
   * @param {string} collectionPath - Path to the Firestore collection.
   * @param {string} docId - ID of the document to delete.
   * @param {string[]} [imagePaths=[]] - Array of storage paths for images to delete.
   * @returns {Promise<Object>} Object with success status or error message.
   */
  async deleteItem(collectionPath, docId, imagePaths = []) {
    try {
      // First, delete the Firestore document
      const firestoreDeleteResult = await this.firestoreService.deleteItem(
        collectionPath,
        docId
      );
      if (!firestoreDeleteResult.success) {
        // If Firestore deletion fails, return the error and don't attempt image deletion.
        return firestoreDeleteResult;
      }

      // If Firestore document deletion is successful, proceed to delete images.
      if (imagePaths && imagePaths.length > 0) {
        // console.log(`Attempting to delete ${imagePaths.length} images from storage.`);
        const deleteImagePromises = imagePaths.map((path) =>
          this.imageService.deleteImage(path)
        );
        const imageDeletionResults = await Promise.all(deleteImagePromises);

        const failedDeletions = imageDeletionResults.filter(
          (res) => !res.success
        );
        if (failedDeletions.length > 0) {
          console.warn("Some images failed to delete:", failedDeletions);
          // You might want to aggregate these errors or handle them
          // For now, we'll consider the overall operation successful if Firestore doc was deleted,
          // but log a warning. Or, you could change success to false.
          return {
            success: true, // Or false if any image deletion failure is critical
            message:
              "Item deleted from Firestore, but some images may not have been removed from storage.",
            imageErrors: failedDeletions,
          };
        }
      }
      // If all went well (Firestore delete and image deletes)
      return { success: true };
    } catch (error) {
      console.error("Error in orchestrated deleteItem:", error);
      return { success: false, error: error.message };
    }
  }

  // --- Real-time Subscriptions (Delegated to FirestoreService) ---
  subscribeToCollection(collectionPath, options = {}) {
    return this.firestoreService.subscribeToCollection(collectionPath, options);
  }

  // --- Paginated Fetch (Delegated to FirestoreService) ---
  async getItemsPaginated(collectionPath, options = {}) {
    return this.firestoreService.getItemsPaginated(collectionPath, options);
  }

  // --- Offline Support (Assuming these remain in FirestoreService or are not directly exposed) ---
  // storePendingOperation(operation) { /* ... if exposing ... */ }
  // async retryPendingOperations() { /* ... if exposing ... */ }

  // --- Cleanup & Health (Delegated or specific to this facade) ---
  cleanup() {
    // Cleanup individual services if they have their own cleanup methods
    if (this.firestoreService.cleanup) {
      this.firestoreService.cleanup();
    }
    // ImageService currently doesn't have a cleanup, but if it did:
    // if (this.imageService.cleanup) { this.imageService.cleanup(); }
    console.log("FirebaseService facade cleaned up.");
  }

  getHealthStatus() {
    // You could combine health statuses from underlying services
    return {
      firestoreStatus: this.firestoreService.getHealthStatus
        ? this.firestoreService.getHealthStatus()
        : "N/A",
      // imageServiceStatus: this.imageService.getHealthStatus ? this.imageService.getHealthStatus() : "N/A",
      timestamp: new Date().toISOString(),
    };
  }

  // --- Specific Collection Helper Methods (Delegated to FirestoreService) ---
  getCollectionRef(collectionNameKey) {
    return this.firestoreService.getCollectionRef(collectionNameKey);
  }

  // Sell Items
  subscribeToSellItems(onUpdateCallback, filterOptions = {}) {
    return this.firestoreService.subscribeToSellItems(
      onUpdateCallback,
      filterOptions
    );
  }
  createSellItem(itemData) {
    return this.addItem(this.firestoreService.collections.sellItems, itemData);
  }
  updateSellItem(itemId, itemData) {
    return this.updateItem(
      this.firestoreService.collections.sellItems,
      itemId,
      itemData
    );
  }
  // deleteSellItem now needs to be called with imagePaths
  async deleteSellItem(itemId, imagePaths = []) {
    return this.deleteItem(
      this.firestoreService.collections.sellItems,
      itemId,
      imagePaths
    );
  }
  getSellItemsPaginated(options = {}) {
    return this.firestoreService.getSellItemsPaginated(
      this.firestoreService.collections.sellItems,
      options
    );
  }

  // Lost & Found Items
  subscribeToLostFoundItems(onUpdateCallback, filterOptions = {}) {
    return this.firestoreService.subscribeToLostFoundItems(
      onUpdateCallback,
      filterOptions
    );
  }
  createLostFoundItem(itemData) {
    return this.addItem(
      this.firestoreService.collections.lostFoundItems,
      itemData
    );
  }
  updateLostFoundItem(itemId, itemData) {
    return this.updateItem(
      this.firestoreService.collections.lostFoundItems,
      itemId,
      itemData
    );
  }
  // deleteLostFoundItem now needs to be called with imagePaths
  async deleteLostFoundItem(itemId, imagePaths = []) {
    return this.deleteItem(
      this.firestoreService.collections.lostFoundItems,
      itemId,
      imagePaths
    );
  }
  getLostFoundItemsPaginated(options = {}) {
    return this.firestoreService.getLostFoundItemsPaginated(
      this.firestoreService.collections.lostFoundItems,
      options
    );
  }

  // User-specific items
  subscribeToUserSellItems(userId, onUpdateCallback) {
    return this.firestoreService.subscribeToUserSellItems(
      userId,
      onUpdateCallback
    );
  }
}

export default new FirebaseService();
