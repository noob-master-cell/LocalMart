// src/store/appStore.js
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

const useAppStore = create(
  subscribeWithSelector((set, get) => ({
    // User state
    user: null,
    isAuthReady: false,

    // Items state with pagination
    items: {
      sell: {
        data: [],
        loading: false,
        hasMore: true,
        lastDoc: null,
        filters: {
          category: "",
          sortBy: "newest",
          priceRange: { min: "", max: "" },
        },
      },
      lostfound: {
        data: [],
        loading: false,
        hasMore: true,
        lastDoc: null,
        filters: { category: "", sortBy: "newest", status: "lost" },
      },
    },

    // UI state
    ui: {
      globalSearch: "",
      modals: {
        addItem: { isOpen: false, editingItem: null, type: "sell" },
        addLostFound: { isOpen: false, editingItem: null, type: "lostfound" },
      },
      messages: [],
    },

    // Connection management
    connections: new Map(),

    // Actions
    setUser: (user) =>
      set((state) => ({
        user,
        isAuthReady: true,
      })),

    setGlobalSearch: (searchTerm) =>
      set((state) => ({
        ui: { ...state.ui, globalSearch: searchTerm },
      })),

    // Optimized item updates
    updateItems: (collection, newItems, append = false) =>
      set((state) => ({
        items: {
          ...state.items,
          [collection]: {
            ...state.items[collection],
            data: append
              ? [...state.items[collection].data, ...newItems]
              : newItems,
            loading: false,
          },
        },
      })),

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

    // Modal management
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

    closeModal: (modalType) =>
      set((state) => ({
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            [modalType]: { isOpen: false, editingItem: null, type: "sell" },
          },
        },
      })),

    // Message management
    addMessage: (message) =>
      set((state) => ({
        ui: {
          ...state.ui,
          messages: [...state.ui.messages, { ...message, id: Date.now() }],
        },
      })),

    removeMessage: (messageId) =>
      set((state) => ({
        ui: {
          ...state.ui,
          messages: state.ui.messages.filter((msg) => msg.id !== messageId),
        },
      })),

    // Connection management for Firebase listeners
    addConnection: (key, unsubscribe) => {
      const connections = get().connections;
      // Clean up existing connection
      if (connections.has(key)) {
        connections.get(key)();
      }
      connections.set(key, unsubscribe);
    },

    removeConnection: (key) => {
      const connections = get().connections;
      if (connections.has(key)) {
        connections.get(key)();
        connections.delete(key);
      }
    },

    clearAllConnections: () => {
      const connections = get().connections;
      connections.forEach((unsubscribe) => unsubscribe());
      connections.clear();
    },

    // Computed selectors for performance
    getFilteredItems: (collection) => {
      const state = get();
      const items = state.items[collection].data;
      const filters = state.items[collection].filters;
      const searchTerm = state.ui.globalSearch;

      return items.filter((item) => {
        // Global search filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          if (
            !item.name?.toLowerCase().includes(term) &&
            !item.description?.toLowerCase().includes(term) &&
            !item.category?.toLowerCase().includes(term)
          ) {
            return false;
          }
        }

        // Category filter
        if (
          filters.category &&
          filters.category !== "All" &&
          item.category !== filters.category
        ) {
          return false;
        }

        // Price range filter (for sell items)
        if (collection === "sell" && filters.priceRange) {
          if (
            filters.priceRange.min &&
            item.price < parseFloat(filters.priceRange.min)
          ) {
            return false;
          }
          if (
            filters.priceRange.max &&
            item.price > parseFloat(filters.priceRange.max)
          ) {
            return false;
          }
        }

        // Status filter (for lost & found items)
        if (
          collection === "lostfound" &&
          filters.status &&
          item.status !== filters.status
        ) {
          return false;
        }

        return true;
      });
    },
  }))
);

// Performance monitoring in development
if (process.env.NODE_ENV === "development") {
  let renderCount = 0;
  useAppStore.subscribe(
    (state) => state.items,
    (items) => {
      renderCount++;
      const totalItems = Object.values(items).reduce(
        (sum, collection) => sum + collection.data.length,
        0
      );

      if (renderCount % 10 === 0) {
        // Log every 10th update
        console.log(
          `[Store Update #${renderCount}] Total items: ${totalItems}`
        );
      }

      if (totalItems > 1000) {
        console.warn(
          "Large state detected:",
          totalItems,
          "items. Consider pagination."
        );
      }
    }
  );
}

export default useAppStore;
