import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  startAfter,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage, appId } from "../firebase"; // Adjust path if firebase.jsx is elsewhere

class FirebaseService {
  constructor() {
    // From OptimizedFirebaseService
    this.queryCache = new Map();
    this.docCache = new Map();
    this.connectionPool = new Map();
    this.batchOperations = [];
    this.batchTimeout = null;
    this.maxCacheSize = 1000; // Default from OptimizedFirebaseService
    this.defaultTTL = 300000; // 5 minutes, from OptimizedFirebaseService

    // From firebaseService
    this.collections = {
      sellItems: `artifacts/${appId}/public/data/sell_items`,
      lostFoundItems: `artifacts/${appId}/public/data/lostfound_items`,
      users: `artifacts/${appId}/users`,
      // Note: item_questions are handled by qaService.js
    };
  }

  // --- Cache Management (from OptimizedFirebaseService) ---
  _getCacheKey(collectionPath, filters = {}) {
    return `${collectionPath}_${JSON.stringify(filters)}`;
  }

  _setCache(key, data, ttl = this.defaultTTL) {
    if (this.queryCache.size >= this.maxCacheSize) {
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
    }
    this.queryCache.set(key, { data, timestamp: Date.now(), ttl });
    setTimeout(() => {
      this.queryCache.delete(key);
    }, ttl);
  }

  _getCache(key) {
    const cached = this.queryCache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.queryCache.delete(key);
      return null;
    }
    return cached.data;
  }

  invalidateCollectionCache(collectionPath) {
    this.queryCache.forEach((value, key) => {
      if (key.startsWith(collectionPath)) {
        this.queryCache.delete(key);
      }
    });
  }

  // --- Connection Pooling (from OptimizedFirebaseService) ---
  _getConnection(key) {
    return this.connectionPool.get(key);
  }

  _setConnection(key, unsubscribe) {
    const existing = this.connectionPool.get(key);
    if (existing) existing();
    this.connectionPool.set(key, unsubscribe);
  }

  _removeConnection(key) {
    const unsubscribe = this.connectionPool.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.connectionPool.delete(key);
    }
  }

  // --- Image Operations (Prioritizing OptimizedFirebaseService versions) ---
  async uploadImage(file, path, options = {}) {
    // path here is typically item type like "sell" or "lostfound"
    const { maxRetries = 3, retryDelay = 1000 } = options;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (!file.type.startsWith("image/"))
          throw new Error("File must be an image");
        if (file.size > 5 * 1024 * 1024)
          throw new Error("Image must be smaller than 5MB"); // Consistent with Optimized

        const imageName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
        const storagePath = `images/${appId}/${path}/${imageName}`; // 'path' used as part of the storage path
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
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * (attempt + 1))
        );
      }
    }
    return {
      success: false,
      error: "Upload failed after multiple retries",
      file: file.name,
    }; // Should not be reached if loop completes
  }

  async uploadMultipleImages(files, path, onProgress) {
    // 'path' here corresponds to 'type' in ItemForm
    const results = { successful: [], failed: [] };
    const totalFiles = files.length;
    let completed = 0;
    const batchSize = 3; // From OptimizedFirebaseService
    const batches = [];

    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const promises = batch.map(async (file) => {
        const result = await this.uploadImage(file, path); // Use the optimized uploadImage
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
        onProgress?.(completed / totalFiles);
      });
      await Promise.all(promises);
    }
    return results;
  }

  async deleteImage(imagePath) {
    // From firebaseService
    try {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting image:", error);
      // Handle common errors like object-not-found, which might not be a "failure" if the goal is to ensure it's gone.
      if (error.code === "storage/object-not-found") {
        console.warn(
          `Image not found at path for deletion (already deleted or wrong path?): ${imagePath}`
        );
        return {
          success: true,
          message: "Image not found, considered deleted.",
        };
      }
      return { success: false, error: error.message };
    }
  }

  // --- CRUD Operations (from OptimizedFirebaseService) ---
  async addItem(collectionPath, data) {
    try {
      const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        createdAt: data.createdAt || Timestamp.now(), // Allow pre-set createdAt
        updatedAt: Timestamp.now(),
      });
      this.invalidateCollectionCache(collectionPath);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding item:", error);
      this.storePendingOperation({
        type: "add",
        collection: collectionPath,
        data,
        timestamp: Date.now(),
      });
      return { success: false, error: error.message };
    }
  }

  async updateItem(collectionPath, docId, updates) {
    const docRef = doc(db, collectionPath, docId);
    try {
      await setDoc(
        docRef,
        { ...updates, updatedAt: Timestamp.now() },
        { merge: true }
      );
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

  async deleteItem(collectionPath, docId, imagePaths = []) {
    try {
      await deleteDoc(doc(db, collectionPath, docId));
      if (imagePaths && imagePaths.length > 0) {
        const deletePromises = imagePaths.map((path) => this.deleteImage(path)); // Use integrated deleteImage
        await Promise.all(deletePromises);
      }
      this.docCache.delete(`${collectionPath}_${docId}`);
      this.invalidateCollectionCache(collectionPath);
      return { success: true };
    } catch (error) {
      console.error("Error deleting item:", error);
      return { success: false, error: error.message };
    }
  }

  // --- Real-time Subscriptions (from OptimizedFirebaseService) ---
  subscribeToCollection(collectionPath, options = {}) {
    const {
      filters = {}, // e.g., { field: 'userId', operator: '==', value: 'someId' } or array of such
      sortBy = { field: "createdAt", direction: "desc" },
      limit: docLimit, // Renamed from limit to docLimit to avoid conflict
      onUpdate,
      onError,
      useCache = true,
    } = options;

    const subscriptionKey = this._getCacheKey(collectionPath, {
      filters,
      sortBy,
      limit: docLimit,
    });
    const existingConnection = this._getConnection(subscriptionKey);
    if (existingConnection) return existingConnection;

    if (useCache) {
      const cached = this._getCache(subscriptionKey);
      if (cached?.items) onUpdate?.(cached.items);
    }

    let q = query(collection(db, collectionPath));
    const constraints = [];

    // Apply filters (assuming filters is an array of {field, operator, value})
    if (Array.isArray(filters)) {
      filters.forEach((filter) => {
        if (
          filter.value !== undefined &&
          filter.value !== null &&
          filter.value !== ""
        ) {
          constraints.push(
            where(filter.field, filter.operator || "==", filter.value)
          );
        }
      });
    } else if (filters.field && filters.value !== undefined) {
      // Handle single filter object
      constraints.push(
        where(filters.field, filters.operator || "==", filters.value)
      );
    }

    if (sortBy && sortBy.field) {
      constraints.push(orderBy(sortBy.field, sortBy.direction || "desc"));
    }
    if (docLimit) {
      constraints.push(limit(docLimit));
    }
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (useCache) this._setCache(subscriptionKey, { items }, 600000); // 10 min TTL
        onUpdate?.(items);
      },
      (error) => {
        console.error("Subscription error:", error);
        onError?.(error);
        setTimeout(() => {
          this._removeConnection(subscriptionKey);
          this.subscribeToCollection(collectionPath, options);
        }, 5000); // Reconnect after 5s
      }
    );

    this._setConnection(subscriptionKey, unsubscribe);
    return unsubscribe;
  }

  // --- Paginated Fetch (from firebaseService) ---
  async getItemsPaginated(collectionPath, options = {}) {
    const {
      filters = {}, // e.g., { field: 'userId', operator: '==', value: 'someId' } or array
      orderByField = "createdAt",
      orderByDirection = "desc",
      pageSize = 20,
      lastDoc = null, // This should be the Firestore DocumentSnapshot
    } = options;

    try {
      let q = query(collection(db, collectionPath));
      const constraints = [];

      if (Array.isArray(filters)) {
        filters.forEach((filter) => {
          if (
            filter.value !== undefined &&
            filter.value !== null &&
            filter.value !== ""
          ) {
            constraints.push(
              where(filter.field, filter.operator || "==", filter.value)
            );
          }
        });
      } else if (filters.field && filters.value !== undefined) {
        constraints.push(
          where(filters.field, filters.operator || "==", filters.value)
        );
      }

      constraints.push(orderBy(orderByField, orderByDirection));
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }
      constraints.push(limit(pageSize));

      q = query(q, ...constraints);

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const newLastVisible = snapshot.docs[snapshot.docs.length - 1];
      const hasMore = snapshot.docs.length === pageSize;

      return { success: true, items, lastVisible: newLastVisible, hasMore };
    } catch (error) {
      console.error("Error fetching paginated items:", error);
      return {
        success: false,
        error: error.message,
        items: [],
        hasMore: false,
      };
    }
  }

  // --- Batch Operations (from OptimizedFirebaseService, if needed - not used directly yet) ---
  async batchOperation(operation) {
    /* ... */
  }
  async executeBatchOperations() {
    /* ... */
  }

  // --- Offline Support (from OptimizedFirebaseService) ---
  storePendingOperation(operation) {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const pendingOps = JSON.parse(
          localStorage.getItem("pendingOperations") || "[]"
        );
        pendingOps.push(operation);
        localStorage.setItem("pendingOperations", JSON.stringify(pendingOps));
      } catch (error) {
        console.error("Failed to store pending op:", error);
      }
    }
  }

  async retryPendingOperations() {
    if (typeof window === "undefined" || !window.localStorage) return;
    // ... (Implementation from OptimizedFirebaseService, ensuring it uses 'this.addItem' etc.)
    const pendingOps = JSON.parse(
      localStorage.getItem("pendingOperations") || "[]"
    );
    if (pendingOps.length === 0) return;
    const successfulOps = [];
    for (const op of pendingOps) {
      try {
        let result;
        if (op.type === "add")
          result = await this.addItem(op.collection, op.data);
        // Add other op types (update, delete) if they are stored for offline
        if (result && result.success) successfulOps.push(op);
      } catch (error) {
        console.error("Failed to retry op:", error);
      }
    }
    const remainingOps = pendingOps.filter(
      (op) =>
        !successfulOps.find(
          (sOp) => sOp.timestamp === op.timestamp && sOp.type === op.type
        )
    ); // More robust filtering
    localStorage.setItem("pendingOperations", JSON.stringify(remainingOps));
    if (successfulOps.length > 0)
      console.log(`Retried ${successfulOps.length} pending ops`);
  }

  // --- Cleanup & Health (from OptimizedFirebaseService) ---
  cleanup() {
    this.connectionPool.forEach((unsubscribe) => unsubscribe());
    this.connectionPool.clear();
    this.queryCache.clear();
    this.docCache.clear();
    if (this.batchTimeout) clearTimeout(this.batchTimeout);
    this.batchOperations = [];
    console.log("FirebaseService cleaned up connections and caches.");
  }

  getHealthStatus() {
    return {
      cacheSize: this.queryCache.size,
      activeConnections: this.connectionPool.size,
      pendingBatchOps: this.batchOperations.length,
      timestamp: new Date().toISOString(),
    };
  }

  // --- Specific Collection Helper Methods (adapted from firebaseService) ---
  getCollectionRef(collectionName) {
    // Renamed from getCollection to avoid conflict if any other tool use this name
    return collection(db, collectionName);
  }

  // Sell Items
  subscribeToSellItems(onUpdateCallback, filterOptions = {}) {
    const options = {
      onUpdate: onUpdateCallback,
      // map firebaseService filter structure to optimizedFirebaseService structure if needed
      // e.g. if filterOptions was { userId: 'uid' }, convert to { field: 'userId', operator: '==', value: 'uid' }
      filters: filterOptions.userId
        ? [{ field: "userId", operator: "==", value: filterOptions.userId }]
        : [],
      limit: filterOptions.limit,
      // sortBy can also be passed via filterOptions if needed
    };
    return this.subscribeToCollection(this.collections.sellItems, options);
  }
  createSellItem(itemData) {
    return this.addItem(this.collections.sellItems, itemData);
  }
  updateSellItem(itemId, itemData) {
    return this.updateItem(this.collections.sellItems, itemId, itemData);
  }
  deleteSellItem(itemId, imagePaths = []) {
    return this.deleteItem(this.collections.sellItems, itemId, imagePaths);
  }
  getSellItemsPaginated(options = {}) {
    return this.getItemsPaginated(this.collections.sellItems, options);
  }

  // Lost & Found Items
  subscribeToLostFoundItems(onUpdateCallback, filterOptions = {}) {
    const filters = [];
    if (filterOptions.status)
      filters.push({
        field: "status",
        operator: "==",
        value: filterOptions.status,
      });
    if (filterOptions.userId)
      filters.push({
        field: "userId",
        operator: "==",
        value: filterOptions.userId,
      });

    const options = {
      onUpdate: onUpdateCallback,
      filters: filters,
      limit: filterOptions.limit,
    };
    return this.subscribeToCollection(this.collections.lostFoundItems, options);
  }
  createLostFoundItem(itemData) {
    return this.addItem(this.collections.lostFoundItems, itemData);
  }
  updateLostFoundItem(itemId, itemData) {
    return this.updateItem(this.collections.lostFoundItems, itemId, itemData);
  }
  deleteLostFoundItem(itemId, imagePaths = []) {
    return this.deleteItem(this.collections.lostFoundItems, itemId, imagePaths);
  }
  getLostFoundItemsPaginated(options = {}) {
    return this.getItemsPaginated(this.collections.lostFoundItems, options);
  }

  // User specific (example)
  subscribeToUserItems(userId, onUpdateCallback) {
    return this.subscribeToSellItems(onUpdateCallback, { userId });
  }
}

export default new FirebaseService();
