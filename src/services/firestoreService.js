// src/services/firestoreService.js
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
import { db, appId } from "../firebase";

class FirestoreService {
  constructor() {
    this.queryCache = new Map();
    this.docCache = new Map();
    this.maxCacheSize = 1000;
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes

    this.connectionPool = new Map(); // For onSnapshot listeners

    this.collections = {
      sellItems: `artifacts/${appId}/public/data/sell_items`,
      lostFoundItems: `artifacts/${appId}/public/data/lostfound_items`,
      users: `artifacts/${appId}/users`,
      // qaService handles item_questions
    };
  }

  // --- Cache Management ---
  _getCacheKey(collectionPath, filters = {}) {
    return `${collectionPath}_${JSON.stringify(filters)}`;
  }

  _setCache(key, data, ttl = this.defaultTTL) {
    if (this.queryCache.size >= this.maxCacheSize) {
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
    }
    this.queryCache.set(key, { data, timestamp: Date.now(), ttl });
    setTimeout(() => this.queryCache.delete(key), ttl);
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
    this.queryCache.forEach((_value, key) => {
      if (key.startsWith(collectionPath)) {
        this.queryCache.delete(key);
      }
    });
    // Also consider invalidating relevant docCache entries if needed
  }

  // --- Connection Pooling for Listeners ---
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

  // --- Generic CRUD Operations ---
  async addItem(collectionPath, data) {
    try {
      const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt
            : Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      this.invalidateCollectionCache(collectionPath);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding item to " + collectionPath + ":", error);
      // Offline support could be added here
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
      this.docCache.delete(`${collectionPath}_${docId}`); // Invalidate specific doc
      this.invalidateCollectionCache(collectionPath); // And broader collection
      return { success: true };
    } catch (error) {
      console.error("Error updating item in " + collectionPath + ":", error);
      return { success: false, error: error.message };
    }
  }

  async deleteItem(collectionPath, docId) {
    // Note: Image deletion should be orchestrated by the calling hook/component using imageService
    try {
      await deleteDoc(doc(db, collectionPath, docId));
      this.docCache.delete(`${collectionPath}_${docId}`);
      this.invalidateCollectionCache(collectionPath);
      return { success: true };
    } catch (error) {
      console.error("Error deleting item from " + collectionPath + ":", error);
      return { success: false, error: error.message };
    }
  }

  // --- Real-time Subscriptions ---
  subscribeToCollection(collectionPath, options = {}) {
    const {
      filtersConfig = [], // Expects array of { field, operator, value }
      sortByConfig = { field: "createdAt", direction: "desc" },
      limitConfig,
      onUpdate,
      onError,
      useCache = true,
    } = options;

    const subscriptionKey = this._getCacheKey(collectionPath, {
      filters: filtersConfig,
      sortBy: sortByConfig,
      limit: limitConfig,
    });

    const existingUnsubscribe = this._getConnection(subscriptionKey);
    if (existingUnsubscribe) return existingUnsubscribe;

    if (useCache) {
      const cached = this._getCache(subscriptionKey);
      if (cached?.items) onUpdate?.(cached.items);
    }

    let q = query(collection(db, collectionPath));
    const constraints = [];

    filtersConfig.forEach((filter) => {
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

    if (sortByConfig && sortByConfig.field) {
      constraints.push(
        orderBy(sortByConfig.field, sortByConfig.direction || "desc")
      );
    }
    if (limitConfig) {
      constraints.push(limit(limitConfig));
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (useCache)
          this._setCache(subscriptionKey, { items }, 10 * 60 * 1000);
        onUpdate?.(items);
      },
      (error) => {
        console.error(`Subscription error for ${collectionPath}:`, error);
        onError?.(error);
        this._removeConnection(subscriptionKey);
        // Consider a retry mechanism or re-throwing
      }
    );

    this._setConnection(subscriptionKey, unsubscribe);
    return unsubscribe;
  }

  // --- Paginated Fetch ---
  async getItemsPaginated(collectionPath, options = {}) {
    const {
      filtersConfig = [],
      orderByField = "createdAt",
      orderByDirection = "desc",
      pageSize = 20,
      lastDoc = null, // Firestore DocumentSnapshot
    } = options;

    try {
      let q = query(collection(db, collectionPath));
      const constraints = [];

      filtersConfig.forEach((filter) => {
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
      constraints.push(orderBy(orderByField, orderByDirection));
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }
      constraints.push(limit(pageSize));

      q = query(q, ...constraints);

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const newLastVisible = snapshot.docs[snapshot.docs.length - 1];
      const hasMore = items.length === pageSize;

      return { success: true, items, lastVisible: newLastVisible, hasMore };
    } catch (error) {
      console.error(
        `Error fetching paginated items from ${collectionPath}:`,
        error
      );
      return {
        success: false,
        error: error.message,
        items: [],
        hasMore: false,
      };
    }
  }

  // --- Specific Collection Helpers ---
  getCollectionRef(collectionNameKey) {
    // e.g., "sellItems"
    const path = this.collections[collectionNameKey];
    if (!path) throw new Error(`Unknown collection key: ${collectionNameKey}`);
    return collection(db, path);
  }

  // Sell Items
  subscribeToSellItems(onUpdateCallback, filterOptions = {}) {
    const filters = [];
    if (filterOptions.userId)
      filters.push({ field: "userId", value: filterOptions.userId });
    // Add other sell-specific filters if needed

    return this.subscribeToCollection(this.collections.sellItems, {
      onUpdate: onUpdateCallback,
      filtersConfig: filters,
      limitConfig: filterOptions.limit,
      // sortByConfig could be passed from filterOptions if needed
    });
  }
  createSellItem(itemData) {
    return this.addItem(this.collections.sellItems, itemData);
  }
  updateSellItem(itemId, itemData) {
    return this.updateItem(this.collections.sellItems, itemId, itemData);
  }
  deleteSellItem(itemId) {
    return this.deleteItem(this.collections.sellItems, itemId);
  } // Image deletion orchestrated by caller
  getSellItemsPaginated(options = {}) {
    return this.getItemsPaginated(this.collections.sellItems, options);
  }

  // Lost & Found Items
  subscribeToLostFoundItems(onUpdateCallback, filterOptions = {}) {
    const filters = [];
    if (filterOptions.status)
      filters.push({ field: "status", value: filterOptions.status });
    if (filterOptions.userId)
      filters.push({ field: "userId", value: filterOptions.userId });
    // Add other L&F-specific filters if needed

    return this.subscribeToCollection(this.collections.lostFoundItems, {
      onUpdate: onUpdateCallback,
      filtersConfig: filters,
      limitConfig: filterOptions.limit,
      // sortByConfig could be passed from filterOptions if needed
    });
  }
  createLostFoundItem(itemData) {
    return this.addItem(this.collections.lostFoundItems, itemData);
  }
  updateLostFoundItem(itemId, itemData) {
    return this.updateItem(this.collections.lostFoundItems, itemId, itemData);
  }
  deleteLostFoundItem(itemId) {
    return this.deleteItem(this.collections.lostFoundItems, itemId);
  } // Image deletion orchestrated by caller
  getLostFoundItemsPaginated(options = {}) {
    return this.getItemsPaginated(this.collections.lostFoundItems, options);
  }

  // User-specific items (assuming sell items for this example)
  subscribeToUserSellItems(userId, onUpdateCallback) {
    return this.subscribeToSellItems(onUpdateCallback, { userId });
  }

  // --- Cleanup ---
  cleanup() {
    this.connectionPool.forEach((unsubscribe) => unsubscribe());
    this.connectionPool.clear();
    this.queryCache.clear();
    this.docCache.clear();
    // Any other cleanup (e.g., batch timeouts)
  }
}

export default new FirestoreService();
