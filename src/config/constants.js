// This file defines various constants used throughout the application.
// Centralizing constants improves maintainability and consistency.

// Defines the application's routes for navigation.
export const ROUTES = {
  HOME: "/", // The main landing page, often redirects.
  BUY: "/buy", // Route for the item Browse/buying section.
  SELL: "/sell", // Route for users to list their items for sale.
  LOST_FOUND: "/lostfound", // Route for the lost and found section.
  AUTH: "/auth", // Base route for authentication pages.
  LOGIN: "/auth/login", // Route for the login page.
  SIGNUP: "/auth/signup", // Route for the signup page.
};

// Defines categories for items, separating them for 'sell' and 'lost_found' sections.
export const CATEGORIES = {
  // Categories for items listed for sale.
  SELL: [
    "Electronics",
    "Furniture",
    "Clothing",
    "Books",
    "Vehicles",
    "Home & Garden",
    "Toys & Games",
    "Sports & Outdoors",
    "Antiques",
    "Services",
    "Other", // General category.
  ],
  // Categories for items listed in the lost and found section.
  LOST_FOUND: [
    "Personal Belongings",
    "Electronics",
    "Keys",
    "Pets",
    "Documents",
    "Bags & Luggage",
    "Wallets & Purses",
    "Jewelry",
    "Other", // General category.
  ],
};

// Defines types for global messages/notifications.
export const MESSAGE_TYPES = {
  SUCCESS: "success", // For successful operations.
  ERROR: "error", // For errors.
  INFO: "info", // For informational messages.
  WARNING: "warning", // For warnings.
};

// Defines various limits used in the application.
export const LIMITS = {
  MAX_IMAGES: 5, // Maximum number of images allowed per item.
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // Maximum image file size (5MB).
  ITEMS_PER_PAGE: 12, // Number of items to display per page (for pagination).
  LOAD_MORE_COUNT: 8, // Number of items to load when "load more" is triggered.
};

// Defines possible statuses for items.
export const ITEM_STATUS = {
  AVAILABLE: "available", // For items currently available for sale.
  SOLD: "sold", // For items that have been sold.
  LOST: "lost", // For items reported as lost.
  FOUND: "found", // For items reported as found.
  // The following statuses were considered but removed:
  // FOUND_CLAIMED: "found_claimed",
  // LOST_RETURNED: "lost_returned",
};
