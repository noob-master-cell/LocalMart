// This file defines the application's global state management using Zustand.
// Zustand is a small, fast, and scalable state management solution.
// `subscribeWithSelector` middleware allows subscribing to specific parts of the state.

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// Create the Zustand store.
// `set` is a function to update the state.
// `get` is a function to access the current state.
const useAppStore = create(
  subscribeWithSelector((set, get) => ({
    // --- State Properties ---

    // User authentication state
    user: null, // Holds the authenticated user object, or null if not logged in.
    isAuthReady: false, // True when Firebase auth state has been checked for the first time.

    // Items state for different collections (e.g., sell, lostfound)
    // Includes data, loading status, pagination info, and filters for each collection.
    items: {
      sell: {
        data: [], // Array of items for sale.
        loading: false, // True when sell items are being fetched.
        hasMore: true, // True if there are more sell items to paginate.
        lastDoc: null, // Firestore document snapshot for pagination.
        filters: {
          category: "", // Current category filter for sell items.
          sortBy: "newest", // Current sort order for sell items.
          priceRange: { min: "", max: "" }, // Current price range filter.
        },
      },
      lostfound: {
        data: [], // Array of lost or found items.
        loading: false, // True when lost/found items are being fetched.
        hasMore: true, // True if there are more lost/found items to paginate.
        lastDoc: null, // Firestore document snapshot for pagination.
        filters: {
          category: "", // Current category filter for lost/found items.
          sortBy: "newest", // Current sort order for lost/found items.
          status: "lost", // Current status filter ('lost' or 'found').
        },
      },
    },

    // UI related state
    ui: {
      globalSearch: "", // Current global search term entered by the user.
      modals: {
        // State for managing the 'addItem' modal.
        addItem: { isOpen: false, editingItem: null, type: "sell" },
        // State for managing the 'addLostFound' modal.
        addLostFound: { isOpen: false, editingItem: null, type: "lostfound" },
      },
      messages: [], // Array of global messages/notifications to display to the user.
    },

    // Firebase listener connection management
    // Stores unsubscribe functions for active Firebase listeners to prevent memory leaks.
    connections: new Map(),

    // --- Actions ---
    // Actions are functions that update the state.

    // Sets the current user and marks authentication as ready.
    setUser: (user) =>
      set(() => ({
        // Changed from set((state) => ...) to set(() => ...) for brevity if state isn't used.
        user,
        isAuthReady: true,
      })),

    // Sets the global search term.
    setGlobalSearch: (searchTerm) =>
      set((state) => ({
        ui: { ...state.ui, globalSearch: searchTerm },
      })),

    // Updates items for a specific collection (e.g., 'sell', 'lostfound').
    // Can append new items or replace existing ones.
    updateItems: (collection, newItems, append = false) =>
      set((state) => ({
        items: {
          ...state.items,
          [collection]: {
            ...state.items[collection],
            data: append
              ? [...state.items[collection].data, ...newItems] // Append if true
              : newItems, // Replace if false
            loading: false, // Reset loading state after update.
          },
        },
      })),

    // Sets the loading state for a specific item collection.
    setItemsLoading: (collection, loading) =>
      set((state) => ({
        items: {
          ...state.items,
          [collection]: {
            ...state.items[collection],
            loading,
          },
        },
      })),

    // Updates filters for a specific item collection.
    updateFilters: (collection, filters) =>
      set((state) => ({
        items: {
          ...state.items,
          [collection]: {
            ...state.items[collection],
            filters: { ...state.items[collection].filters, ...filters },
          },
        },
      })),

    // Opens a specified modal.
    // `editingItem` can be passed if opening the modal to edit an existing item.
    // `itemType` specifies the context (e.g., 'sell', 'lostfound').
    openModal: (modalType, editingItem = null, itemType = "sell") =>
      set((state) => ({
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            [modalType]: { isOpen: true, editingItem, type: itemType },
          },
        },
      })),

    // Closes a specified modal and resets its editing state.
    closeModal: (modalType) =>
      set((state) => ({
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            // Resets modal state upon closing.
            [modalType]: { isOpen: false, editingItem: null, type: "sell" },
          },
        },
      })),

    // Adds a new message to the global messages array.
    // Each message gets a unique ID based on the current timestamp.
    addMessage: (message) =>
      set((state) => ({
        ui: {
          ...state.ui,
          messages: [...state.ui.messages, { ...message, id: Date.now() }],
        },
      })),

    // Removes a message from the global messages array by its ID.
    removeMessage: (messageId) =>
      set((state) => ({
        ui: {
          ...state.ui,
          messages: state.ui.messages.filter((msg) => msg.id !== messageId),
        },
      })),

    // Manages Firebase listener connections.
    // Adds a new listener's unsubscribe function to the `connections` map.
    // If a listener for the same key already exists, it's unsubscribed first.
    addConnection: (key, unsubscribe) => {
      const connections = get().connections;
      if (connections.has(key)) {
        connections.get(key)(); // Unsubscribe existing listener for this key.
      }
      connections.set(key, unsubscribe);
    },

    // Removes and unsubscribes a Firebase listener by its key.
    removeConnection: (key) => {
      const connections = get().connections;
      if (connections.has(key)) {
        connections.get(key)(); // Unsubscribe the listener.
        connections.delete(key); // Remove from map.
      }
    },

    // Clears all active Firebase listeners.
    // Useful on user logout or component unmount to prevent memory leaks.
    clearAllConnections: () => {
      const connections = get().connections;
      connections.forEach((unsubscribe) => unsubscribe()); // Unsubscribe all.
      connections.clear(); // Clear the map.
    },

    // --- Computed Selectors ---
    // Selectors derive data from the state, often performing filtering or computation.
    // This helps in keeping components clean and state logic centralized.

    // Gets filtered items for a specific collection based on global search and collection-specific filters.
    getFilteredItems: (collection) => {
      const state = get(); // Get current state.
      const items = state.items[collection].data;
      const filters = state.items[collection].filters;
      const searchTerm = state.ui.globalSearch;

      return items.filter((item) => {
        // Apply global search term (case-insensitive).
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          // Check against item name, description, and category.
          if (
            !item.name?.toLowerCase().includes(term) &&
            !item.description?.toLowerCase().includes(term) &&
            !item.category?.toLowerCase().includes(term)
          ) {
            return false; // Exclude if no match.
          }
        }

        // Apply category filter (if set and not 'All').
        if (
          filters.category &&
          filters.category !== "All" && // Assuming 'All' means no category filter.
          item.category !== filters.category
        ) {
          return false; // Exclude if category doesn't match.
        }

        // Apply price range filter (for 'sell' items).
        if (collection === "sell" && filters.priceRange) {
          if (
            filters.priceRange.min &&
            item.price < parseFloat(filters.priceRange.min)
          ) {
            return false; // Exclude if price is below min.
          }
          if (
            filters.priceRange.max &&
            item.price > parseFloat(filters.priceRange.max)
          ) {
            return false; // Exclude if price is above max.
          }
        }

        // Apply status filter (for 'lostfound' items).
        if (
          collection === "lostfound" &&
          filters.status &&
          item.status !== filters.status
        ) {
          return false; // Exclude if status doesn't match.
        }

        return true; // Include item if all checks pass.
      });
    },
  }))
);

// Performance monitoring in development environment.
// Subscribes to item changes and logs information if conditions are met.
if (process.env.NODE_ENV === "development") {
  let renderCount = 0;
  // Subscribe to changes in the `items` part of the state.
  useAppStore.subscribe(
    (state) => state.items, // Selector for the `items` state.
    (items) => {
      // Callback function when `items` state changes.
      renderCount++;
      const totalItems = Object.values(items).reduce(
        (sum, collection) => sum + collection.data.length,
        0
      );

      // Log every 10th update to avoid excessive logging.
      if (renderCount % 10 === 0) {
        console.log(
          `[Store Update #${renderCount}] Total items: ${totalItems}`
        );
      }

      // Warn if the total number of items exceeds a threshold.
      if (totalItems > 1000) {
        console.warn(
          "Large state detected:",
          totalItems,
          "items. Consider pagination or virtualization strategies."
        );
      }
    }
  );
}

export default useAppStore;
