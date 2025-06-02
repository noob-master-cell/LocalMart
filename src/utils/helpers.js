// This module provides various helper functions used throughout the application,
// such as date formatting, input validation, URL generation, text manipulation,
// and utility functions for sorting and filtering items.

/**
 * Formats a Firestore timestamp or JavaScript Date object into a relative time string
 * (e.g., "2 hours ago", "Just now"). Falls back to a localized date string for older dates.
 *
 * @param {object|Date} timestamp - The timestamp to format. Can be a Firestore Timestamp
 * (with `seconds` property) or a JavaScript Date object.
 * @returns {string} The formatted relative time string or "Unknown time" if timestamp is invalid.
 */
export const formatRelativeTime = (timestamp) => {
  // Return "Unknown time" if the timestamp is null or undefined.
  if (!timestamp) return "Unknown time";

  const now = new Date();
  // Convert Firestore timestamp (if applicable) or use existing Date object.
  const date = timestamp.seconds
    ? new Date(timestamp.seconds * 1000)
    : new Date(timestamp);
  const diffInSeconds = Math.floor((now - date) / 1000);

  // Provide relative time strings based on the difference in seconds.
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    // Less than a week
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  // For older dates, return a localized date string.
  return date.toLocaleDateString();
};

/**
 * Cleans and validates a WhatsApp phone number.
 *
 * @param {string} number - The WhatsApp number string to validate.
 * @returns {object} An object containing:
 * `isValid` (boolean): True if the number is valid.
 * `cleanNumber` (string): The cleaned number (digits and '+' only) if valid.
 * `error` (string|null): An error message if invalid, otherwise null.
 */
export const validateWhatsApp = (number) => {
  if (!number) return { isValid: false, error: "WhatsApp number is required" };

  // Remove spaces from the number.
  const cleanNumber = number.replace(/\s+/g, "");
  // Regex for basic WhatsApp number validation (7-15 digits, optional '+').
  const whatsappRegex = /^\+?\d{7,15}$/;
  const isValid = whatsappRegex.test(cleanNumber);

  return {
    isValid,
    // Further clean to remove any non-digit characters except leading '+'.
    cleanNumber: cleanNumber.replace(/[^\d+]/g, ""),
    error: isValid ? null : "Invalid WhatsApp number format",
  };
};

/**
 * Generates a WhatsApp "click to chat" URL.
 *
 * @param {string} number - The WhatsApp phone number.
 * @param {string} itemName - The name of the item to pre-fill in the message.
 * @returns {string|null} The generated WhatsApp URL, or null if the number is invalid.
 */
export const generateWhatsAppURL = (number, itemName) => {
  const { isValid, cleanNumber } = validateWhatsApp(number);

  if (!isValid) return null;

  // Pre-filled message for WhatsApp.
  const message = encodeURIComponent(
    `Hi, I'm interested in your item: "${itemName}" listed on LocalMart.`
  );

  return `https://wa.me/${cleanNumber}?text=${message}`;
};

/**
 * Formats a numerical price into a currency string (e.g., "€10.50").
 * Displays "N/A" if the price is null or not a number.
 *
 * @param {number|null|undefined} price - The price to format.
 * @returns {string} The formatted price string.
 */
export const formatPrice = (price) => {
  if (price == null || isNaN(price)) return "N/A";
  // Formats the price to two decimal places with a Euro symbol.
  return `€${Number(price).toFixed(2)}`;
};

/**
 * Truncates a string to a specified maximum length and appends an ellipsis if truncated.
 *
 * @param {string} text - The text to truncate.
 * @param {number} [maxLength=100] - The maximum length of the text.
 * @returns {string} The truncated text, or the original text if it's shorter than maxLength.
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

/**
 * Generates a URL for a placeholder image from `placehold.co`.
 *
 * @param {string} [text="No Image"] - The text to display on the placeholder image.
 * @param {number} [width=600] - The width of the placeholder image.
 * @param {number} [height=400] - The height of the placeholder image.
 * @returns {string} The URL of the placeholder image.
 */
export const getPlaceholderImage = (
  text = "No Image",
  width = 600,
  height = 400
) => {
  return `https://placehold.co/${width}x${height}/e2e8f0/94a3b8?text=${encodeURIComponent(
    text
  )}`;
};

/**
 * Validates an image file based on its type and size.
 *
 * @param {File} file - The file to validate.
 * @param {number} [maxSize=5*1024*1024] - The maximum allowed file size in bytes (default 5MB).
 * @returns {object} An object containing:
 * `isValid` (boolean): True if the file is a valid image.
 * `error` (string|null): An error message if invalid, otherwise null.
 */
export const validateImageFile = (file, maxSize = 5 * 1024 * 1024) => {
  // Check if the file type starts with "image/".
  if (!file.type.startsWith("image/")) {
    return { isValid: false, error: "File must be an image" };
  }

  // Check if the file size exceeds the maximum allowed size.
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Image must be smaller than ${maxSize / (1024 * 1024)}MB`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Debounces a function, delaying its execution until after a specified wait time
 * has elapsed since the last time it was invoked. Useful for rate-limiting
 * functions called frequently, like search input handlers.
 *
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    // Arrow function `later` captures `this` and `args` from the outer scope.
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args); // Preserve `this` context and pass arguments.
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Sorts an array of items based on a specified sorting criterion.
 *
 * @param {Array<object>} items - The array of items to sort. Items are expected to have
 * properties like `createdAt`, `price`, and `name`.
 * @param {string} [sortBy="newest"] - The sorting criterion.
 * Possible values: "newest", "oldest",
 * "price-low", "price-high", "alphabetical".
 * @returns {Array<object>} A new array with the sorted items.
 */
export const sortItems = (items, sortBy = "newest") => {
  // Create a shallow copy to avoid mutating the original array.
  const sortedItems = [...items];

  switch (sortBy) {
    case "newest":
      // Sort by creation timestamp, descending (newest first).
      // Uses optional chaining and default to 0 if createdAt or seconds is missing.
      return sortedItems.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
    case "oldest":
      // Sort by creation timestamp, ascending (oldest first).
      return sortedItems.sort(
        (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
      );
    case "price-low":
      // Sort by price, ascending (lowest first).
      // Defaults to 0 if price is missing.
      return sortedItems.sort((a, b) => (a.price || 0) - (b.price || 0));
    case "price-high":
      // Sort by price, descending (highest first).
      return sortedItems.sort((a, b) => (b.price || 0) - (a.price || 0));
    case "alphabetical":
      // Sort by name, alphabetically.
      // Defaults to empty string if name is missing.
      return sortedItems.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    default:
      // Return the original (copied) array if sortBy is unrecognized.
      return sortedItems;
  }
};

/**
 * Filters an array of items based on various criteria.
 *
 * @param {Array<object>} items - The array of items to filter.
 * @param {object} filters - An object containing filter criteria:
 * `searchTerm` (string): Text to search in item name/description.
 * `category` (string): Category to filter by.
 * `status` (string): Status to filter by (e.g., "lost", "found").
 * `priceRange` (object): {min, max} for price filtering.
 * @returns {Array<object>} A new array with the filtered items.
 */
export const filterItems = (items, filters) => {
  const { searchTerm, category, status, priceRange } = filters;

  return items.filter((item) => {
    // Text search (case-insensitive)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const nameMatch = item.name?.toLowerCase().includes(term);
      const descriptionMatch = item.description?.toLowerCase().includes(term);
      // If neither name nor description matches, exclude the item.
      if (!nameMatch && !descriptionMatch) return false;
    }

    // Category filter
    // If a category is specified and the item's category doesn't match, exclude it.
    if (category && item.category !== category) return false;

    // Status filter
    // If a status is specified and the item's status doesn't match, exclude it.
    if (status && item.status !== status) return false;

    // Price range filter
    // Applied only if priceRange is defined and the item has a price.
    if (priceRange && item.price != null) {
      const { min, max } = priceRange;
      // Exclude if price is below min (and min is specified).
      if (min !== null && item.price < min) return false;
      // Exclude if price is above max (and max is specified).
      if (max !== null && item.price > max) return false;
    }

    // If all checks pass, include the item.
    return true;
  });
};
