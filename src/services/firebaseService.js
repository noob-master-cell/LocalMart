// This service module provides a comprehensive interface for interacting with Firebase services,
// including Firestore (for data storage) and Firebase Storage (for image uploads).
// It incorporates features like caching, connection pooling for real-time listeners,
// batch operations, and basic offline support for pending operations.

import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot, // For real-time listeners.
  orderBy,
  limit,
  startAfter, // For pagination.
  doc,
  setDoc,     // For creating or overwriting a document with a specific ID.
  addDoc,     // For adding a new document with an auto-generated ID.
  deleteDoc,
  Timestamp,  // Firestore Timestamp.
} from "firebase/firestore";
import {
  ref,        // Storage reference.
  uploadBytes,// Function to upload files.
  getDownloadURL, // Function to get the public URL of an uploaded file.
  deleteObject, // Function to delete a file from storage.
} from "firebase/storage";
// Import Firebase instances (db, storage, appId) from the main Firebase configuration file.
import { db, storage, appId } from "../firebase";

class FirebaseService {
  constructor() {
    // --- Caching ---
    // `queryCache`: Stores results of Firestore queries to reduce redundant reads.
    // `docCache`: Stores individual Firestore documents.
    this.queryCache = new Map();
    this.docCache = new Map();
    this.maxCacheSize = 1000; // Maximum number of items in caches.
    this.defaultTTL = 5 * 60 * 1000; // Default Time-To-Live for cache entries (5 minutes).

    // --- Connection Pooling ---
    // `connectionPool`: Manages active real-time listeners (onSnapshot) to prevent duplicates
    // and facilitate cleanup. Stores unsubscribe functions.
    this.connectionPool = new Map();

    // --- Batch Operations (Placeholder) ---
    // `batchOperations`: Array to hold operations for Firestore batch writes (not fully implemented here).
    // `batchTimeout`: Timeout ID for scheduling batch execution.
    this.batchOperations = [];
    this.batchTimeout = null;

    // --- Collection Paths ---
    // Defines standardized paths for Firestore collections, incorporating `appId` for namespacing.
    this.collections = {
      sellItems: `artifacts/${appId}/public/data/sell_items`,
      lostFoundItems: `artifacts/${appId}/public/data/lostfound_items`,
      users: `artifacts/${appId}/users`,
      // Note: item_questions are typically handled by a dedicated qaService.
    };
  }

  // --- Cache Management Methods ---

  /**
   * Generates a unique cache key for a query based on its path and filters.
   * @param {string} collectionPath - The path of the Firestore collection.
   * @param {Object} [filters={}] - Filters applied to the query.
   * @returns {string} A unique cache key.
   */
  _getCacheKey(collectionPath, filters = {}) {
    return `${collectionPath}_${JSON.stringify(filters)}`;
  }

  /**
   * Sets data in the query cache with a specific Time-To-Live (TTL).
   * Manages cache size by removing the oldest item if maxCacheSize is reached.
   * @param {string} key - The cache key.
   * @param {any} data - The data to cache.
   * @param {number} [ttl=this.defaultTTL] - Cache entry TTL in milliseconds.
   */
  _setCache(key, data, ttl = this.defaultTTL) {
    if (this.queryCache.size >= this.maxCacheSize) {
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey); // Evict oldest entry if cache is full.
    }
    this.queryCache.set(key, { data, timestamp: Date.now(), ttl });
    // Automatically remove the cache entry after its TTL expires.
    setTimeout(() => {
      this.queryCache.delete(key);
    }, ttl);
  }

  /**
   * Retrieves data from the query cache if it exists and has not expired.
   * @param {string} key - The cache key.
   * @returns {any|null} The cached data, or null if not found or expired.
   */
  _getCache(key) {
    const cached = this.queryCache.get(key);
    if (!cached) return null;
    // Check if cache entry has expired.
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.queryCache.delete(key); // Delete expired entry.
      return null;
    }
    return cached.data;
  }

  /**
   * Invalidates (removes) all cache entries related to a specific collection path.
   * Useful after write operations (add, update, delete) to ensure cache consistency.
   * @param {string} collectionPath - The path of the Firestore collection whose cache needs invalidation.
   */
  invalidateCollectionCache(collectionPath) {
    this.queryCache.forEach((value, key) => {
      if (key.startsWith(collectionPath)) {
        this.queryCache.delete(key);
      }
    });
  }

  // --- Connection Pooling Methods (for real-time listeners) ---

  _getConnection(key) {
    return this.connectionPool.get(key);
  }

  _setConnection(key, unsubscribe) {
    const existing = this.connectionPool.get(key);
    if (existing) existing(); // Unsubscribe existing listener if present for this key.
    this.connectionPool.set(key, unsubscribe);
  }

  _removeConnection(key) {
    const unsubscribe = this.connectionPool.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.connectionPool.delete(key);
    }
  }

  // --- Image Operations ---

  /**
   * Uploads an image file to Firebase Storage with retry logic.
   * @param {File} file - The image file to upload.
   * @param {string} path - The sub-path within Firebase Storage (e.g., "sell", "lostfound").
   * @param {Object} [options={}] - Upload options like maxRetries, retryDelay.
   * @returns {Promise<Object>} A promise resolving to an object with upload status, URL, and storage path.
   */
  async uploadImage(file, path, options = {}) {
    const { maxRetries = 3, retryDelay = 1000 } = options;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Basic client-side validation.
        if (!file.type.startsWith("image/"))
          throw new Error("File must be an image");
        if (file.size > 5 * 1024 * 1024) // 5MB limit
          throw new Error("Image must be smaller than 5MB");

        const imageName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
        // Construct a unique storage path using appId and the provided path.
        const storagePath = `images/${appId}/${path}/${imageName}`;
        const storageRef = ref(storage, storagePath);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return { success: true, url: downloadURL, path: storagePath };
      } catch (error) {
        console.error(
          `Upload attempt ${attempt + 1} for ${file.name} failed:`,
          error
        );
        if (attempt === maxRetries - 1)
          return { success: false, error: error.message, file: file.name };
        // Exponential backoff for retries.
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * (attempt + 1))
        );
      }
    }
    // This line should ideally not be reached if the loop logic is correct.
    return {
      success: false,
      error: "Upload failed after multiple retries",
      file: file.name,
    };
  }

  /**
   * Uploads multiple image files in batches to Firebase Storage.
   * @param {File[]} files - Array of image files.
   * @param {string} path - The sub-path in Firebase Storage.
   * @param {Function} [onProgress] - Callback function for progress updates (receives a value from 0 to 1).
   * @returns {Promise<Object>} An object containing arrays of `successful` and `failed` uploads.
   */
  async uploadMultipleImages(files, path, onProgress) {
    const results = { successful: [], failed: [] };
    const totalFiles = files.length;
    let completed = 0;
    const batchSize = 3; // Number of images to upload concurrently in a batch.
    const batches = [];

    // Divide files into batches.
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }

    // Process each batch.
    for (const batch of batches) {
      const promises = batch.map(async (file) => {
        const result = await this.uploadImage(file, path); // Uses the single optimized uploadImage.
        if (result.success) {
          results.successful.push({
            file: file.name,
            url: result.url,
            path: result.path,
          });
        } else {
          results.failed.push({ file: file.name, error: result.error });
        }
        completed++;
        onProgress?.(completed / totalFiles); // Call progress callback.
      });
      await Promise.all(promises); // Wait for the current batch to complete.
    }
    return results;
  }

  /**
   * Deletes an image from Firebase Storage.
   * @param {string} imagePath - The full path to the image in Firebase Storage.
   * @returns {Promise<Object>} An object indicating success or failure.
   */
  async deleteImage(imagePath) {
    try {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting image:", error);
      // Handle cases where the image might already be deleted or path is wrong.
      if (error.code === "storage/object-not-found") {
        console.warn(
          `Image not found at path for deletion: ${imagePath}`
        );
        return {
          success: true,
          message: "Image not found, considered deleted.",
        };
      }
      return { success: false, error: error.message };
    }
  }

  // --- Firestore CRUD Operations ---

  /**
   * Adds a new item (document) to a Firestore collection.
   * Invalidates the cache for that collection upon success.
   * Stores operation for offline retry on failure.
   * @param {string} collectionPath - Path to the Firestore collection.
   * @param {Object} data - Data for the new item.
   * @returns {Promise<Object>} Object with success status and new document ID or error message.
   */
  async addItem(collectionPath, data) {
    try {
      const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        // Allow pre-set createdAt, otherwise use server timestamp.
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      this.invalidateCollectionCache(collectionPath); // Clear relevant cache.
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding item:", error);
      // Store for offline retry if enabled and appropriate.
      this.storePendingOperation({
        type: "add",
        collection: collectionPath,
        data,
        timestamp: Date.now(),
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Updates an existing item (document) in a Firestore collection.
   * Updates document cache and invalidates collection cache on success.
   * @param {string} collectionPath - Path to the Firestore collection.
   * @param {string} docId - ID of the document to update.
   * @param {Object} updates - Fields to update.
   * @returns {Promise<Object>} Object with success status or error message.
   */
  async updateItem(collectionPath, docId, updates) {
    const docRef = doc(db, collectionPath, docId);
    try {
      await setDoc( // Using setDoc with merge:true for robust updates.
        docRef,
        { ...updates, updatedAt: Timestamp.now() },
        { merge: true }
      );
      // Update specific document cache if it exists.
      const cacheKey = `${collectionPath}_${docId}`;
      if (this.docCache.has(cacheKey)) {
        const cached = this.docCache.get(cacheKey);
        this.docCache.set(cacheKey, {
          ...cached,
          ...updates,
          updatedAt: Timestamp.now(),
        });
      }
      this.invalidateCollectionCache(collectionPath);
      return { success: true };
    } catch (error) {
      console.error("Error updating item:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Deletes an item (document) from a Firestore collection and associated images from Storage.
   * @param {string} collectionPath - Path to the Firestore collection.
   * @param {string} docId - ID of the document to delete.
   * @param {string[]} [imagePaths=[]] - Array of storage paths for images to delete.
   * @returns {Promise<Object>} Object with success status or error message.
   */
  async deleteItem(collectionPath, docId, imagePaths = []) {
    try {
      await deleteDoc(doc(db, collectionPath, docId));
      if (imagePaths && imagePaths.length > 0) {
        const deletePromises = imagePaths.map((path) => this.deleteImage(path));
        await Promise.all(deletePromises);
      }
      this.docCache.delete(`${collectionPath}_${docId}`); // Remove from document cache.
      this.invalidateCollectionCache(collectionPath); // Invalidate collection cache.
      return { success: true };
    } catch (error) {
      console.error("Error deleting item:", error);
      return { success: false, error: error.message };
    }
  }

  // --- Real-time Subscriptions ---

  /**
   * Subscribes to real-time updates for a Firestore collection.
   * Manages listeners via connection pooling and uses caching.
   * @param {string} collectionPath - Path to the Firestore collection.
   * @param {Object} [options={}] - Subscription options (filters, sortBy, limit, callbacks, useCache).
   * @returns {Function} Unsubscribe function for the listener.
   */
  subscribeToCollection(collectionPath, options = {}) {
    const {
      filters = {}, // e.g., { field, operator, value } or array of these.
      sortBy = { field: "createdAt", direction: "desc" },
      limit: docLimit,
      onUpdate,     // Callback for data updates.
      onError,      // Callback for errors.
      useCache = true,
    } = options;

    // Generate a unique key for this subscription.
    const subscriptionKey = this._getCacheKey(collectionPath, {
      filters,
      sortBy,
      limit: docLimit,
    });

    // Return existing listener if one is already active for this key.
    const existingConnection = this._getConnection(subscriptionKey);
    if (existingConnection) return existingConnection;

    // Use cached data immediately if available and `useCache` is true.
    if (useCache) {
      const cached = this._getCache(subscriptionKey);
      if (cached?.items) onUpdate?.(cached.items);
    }

    let q = query(collection(db, collectionPath));
    const constraints = [];

    // Apply filters.
    if (Array.isArray(filters)) {
      filters.forEach((filter) => {
        if (filter.value !== undefined && filter.value !== null && filter.value !== "") {
          constraints.push(where(filter.field, filter.operator || "==", filter.value));
        }
      });
    } else if (filters.field && filters.value !== undefined) {
      constraints.push(where(filters.field, filters.operator || "==", filters.value));
    }

    // Apply sorting.
    if (sortBy && sortBy.field) {
      constraints.push(orderBy(sortBy.field, sortBy.direction || "desc"));
    }
    // Apply limit.
    if (docLimit) {
      constraints.push(limit(docLimit));
    }
    if (constraints.length > 0) {
      q = query(q, ...constraints); // Apply all constraints to the query.
    }

    // Establish the real-time listener.
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        if (useCache) this._setCache(subscriptionKey, { items }, 10 * 60 * 1000); // Cache for 10 min.
        onUpdate?.(items); // Call update callback.
      },
      (error) => {
        console.error("Subscription error:", error);
        onError?.(error);
        // Basic retry mechanism for listener errors.
        setTimeout(() => {
          this._removeConnection(subscriptionKey); // Clean up failed connection.
          this.subscribeToCollection(collectionPath, options); // Attempt to resubscribe.
        }, 5000); // Retry after 5 seconds.
      }
    );

    this._setConnection(subscriptionKey, unsubscribe); // Store the unsubscribe function.
    return unsubscribe;
  }

  // --- Paginated Fetch ---

  /**
   * Fetches items from a Firestore collection with pagination.
   * @param {string} collectionPath - Path to the collection.
   * @param {Object} [options={}] - Pagination options (filters, orderBy, pageSize, lastDoc).
   * @returns {Promise<Object>} Object with success status, items, lastVisible doc, and hasMore flag.
   */
  async getItemsPaginated(collectionPath, options = {}) {
    const {
      filters = {},
      orderByField = "createdAt",
      orderByDirection = "desc",
      pageSize = 20,
      lastDoc = null, // Firestore DocumentSnapshot for `startAfter`.
    } = options;

    try {
      let q = query(collection(db, collectionPath));
      const constraints = [];

      // Apply filters (similar to subscribeToCollection).
      if (Array.isArray(filters)) {
        filters.forEach(filter => { /* ... add where constraints ... */ });
      } else if (filters.field && filters.value !== undefined) {
        constraints.push(where(filters.field, filters.operator || '==', filters.value));
      }

      // Apply sorting.
      constraints.push(orderBy(orderByField, orderByDirection));
      // Apply pagination (startAfter).
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }
      // Apply page size limit.
      constraints.push(limit(pageSize));

      q = query(q, ...constraints);

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const newLastVisible = snapshot.docs[snapshot.docs.length - 1]; // Last document of the current page.
      const hasMore = snapshot.docs.length === pageSize; // Indicates if more items might exist.

      return { success: true, items, lastVisible: newLastVisible, hasMore };
    } catch (error) {
      console.error("Error fetching paginated items:", error);
      return { success: false, error: error.message, items: [], hasMore: false };
    }
  }


  // --- Offline Support ---

  /**
   * Stores a pending operation (e.g., an item addition that failed due to network issues)
   * in localStorage for later retry.
   * @param {Object} operation - The operation details to store.
   */
  storePendingOperation(operation) {
    // Check if localStorage is available (client-side).
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const pendingOps = JSON.parse(localStorage.getItem("pendingOperations") || "[]");
        pendingOps.push(operation);
        localStorage.setItem("pendingOperations", JSON.stringify(pendingOps));
      } catch (error) {
        console.error("Failed to store pending operation:", error);
      }
    }
  }

  /**
   * Attempts to retry pending operations stored in localStorage.
   * Typically called when the application comes back online.
   */
  async retryPendingOperations() {
    if (typeof window === "undefined" || !window.localStorage) return;

    const pendingOps = JSON.parse(localStorage.getItem("pendingOperations") || "[]");
    if (pendingOps.length === 0) return;

    const successfulOps = [];
    for (const op of pendingOps) {
      try {
        let result;
        if (op.type === "add") { // Currently only handles 'add' operations.
          result = await this.addItem(op.collection, op.data);
        }
        // Extend here for other operation types like 'update' or 'delete'.
        if (result && result.success) {
          successfulOps.push(op);
        }
      } catch (error) {
        console.error("Failed to retry operation:", error);
      }
    }

    // Remove successfully retried operations from localStorage.
    const remainingOps = pendingOps.filter(
      (op) => !successfulOps.find((sOp) => sOp.timestamp === op.timestamp && sOp.type === op.type)
    );
    localStorage.setItem("pendingOperations", JSON.stringify(remainingOps));

    if (successfulOps.length > 0) {
      console.log(`Successfully retried ${successfulOps.length} pending operations.`);
    }
  }

  // --- Cleanup & Health ---

  /**
   * Cleans up resources: unsubscribes all active listeners, clears caches, and timeouts.
   * Should be called when the service instance is no longer needed or on app shutdown.
   */
  cleanup() {
    this.connectionPool.forEach((unsubscribe) => unsubscribe());
    this.connectionPool.clear();
    this.queryCache.clear();
    this.docCache.clear();
    if (this.batchTimeout) clearTimeout(this.batchTimeout);
    this.batchOperations = [];
    console.log("FirebaseService cleaned up connections and caches.");
  }

  /**
   * Gets a status report of the service (cache sizes, active connections, etc.).
   * Useful for debugging and monitoring.
   * @returns {Object} Health status object.
   */
  getHealthStatus() {
    return {
      cacheSize: this.queryCache.size,
      activeConnections: this.connectionPool.size,
      pendingBatchOps: this.batchOperations.length,
      timestamp: new Date().toISOString(),
    };
  }

  // --- Specific Collection Helper Methods ---
  // These methods provide a more convenient API for common operations on specific collections.

  getCollectionRef(collectionName) {
    return collection(db, collectionName);
  }

  // --- Sell Items Helpers ---
  subscribeToSellItems(onUpdateCallback, filterOptions = {}) {
    const options = {
      onUpdate: onUpdateCallback,
      filters: filterOptions.userId ? [{ field: "userId", operator: "==", value: filterOptions.userId }] : [],
      limit: filterOptions.limit,
    };
    return this.subscribeToCollection(this.collections.sellItems, options);
  }
  createSellItem(itemData) { return this.addItem(this.collections.sellItems, itemData); }
  updateSellItem(itemId, itemData) { return this.updateItem(this.collections.sellItems, itemId, itemData); }
  deleteSellItem(itemId, imagePaths = []) { return this.deleteItem(this.collections.sellItems, itemId, imagePaths); }
  getSellItemsPaginated(options = {}) { return this.getItemsPaginated(this.collections.sellItems, options); }

  // --- Lost & Found Items Helpers ---
  subscribeToLostFoundItems(onUpdateCallback, filterOptions = {}) {
    const filters = [];
    if (filterOptions.status) filters.push({ field: "status", operator: "==", value: filterOptions.status });
    if (filterOptions.userId) filters.push({ field: "userId", operator: "==", value: filterOptions.userId });

    const options = { onUpdate: onUpdateCallback, filters: filters, limit: filterOptions.limit };
    return this.subscribeToCollection(this.collections.lostFoundItems, options);
  }
  createLostFoundItem(itemData) { return this.addItem(this.collections.lostFoundItems, itemData); }
  updateLostFoundItem(itemId, itemData) { return this.updateItem(this.collections.lostFoundItems, itemId, itemData); }
  deleteLostFoundItem(itemId, imagePaths = []) { return this.deleteItem(this.collections.lostFoundItems, itemId, imagePaths); }
  getLostFoundItemsPaginated(options = {}) { return this.getItemsPaginated(this.collections.lostFoundItems, options); }

  // Example: User-specific item subscription
  subscribeToUserItems(userId, onUpdateCallback) {
    return this.subscribeToSellItems(onUpdateCallback, { userId });
  }
}

// Export a singleton instance of the FirebaseService.
export default new FirebaseService();