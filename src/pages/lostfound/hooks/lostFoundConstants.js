// This file defines constants specifically for the "Lost & Found" feature.
// Centralizing these constants improves maintainability and consistency.

// Array of categories for Lost & Found items.
// Used for filtering and in the item submission form.
export const LOSTFOUND_CATEGORIES = [
  "Personal Belongings", // e.g., glasses, umbrella
  "Electronics", // e.g., phones, laptops, headphones
  "Keys",
  "Pets", // For lost or found animals
  "Documents", // e.g., ID cards, passports
  "Bags & Luggage",
  "Wallets & Purses",
  "Jewelry",
  "Other", // A general category for items not fitting elsewhere.
];

// Options for the status filter (Lost Items / Found Items).
// Used in the Lost & Found header and for querying items.
export const STATUS_OPTIONS = [
  { value: "lost", label: "Lost Items" },
  { value: "found", label: "Found Items" },
];

// Example: Default filter settings for the Lost & Found page.
// This could be used to initialize the filter state in the `useLostFoundData` hook
// or the `LostAndFoundSection` component.
// export const DEFAULT_LOSTFOUND_FILTERS = {
//   category: "", // Default to no category filter.
//   sortBy: "newest", // Default sort order.
//   status: "lost", // Default to showing "lost" items.
// };

// Note: General ITEM_STATUS constants (like "lost", "found") are defined in `src/config/constants.js`.
// This file focuses on constants specific to the L&F feature's UI and logic,
// such as category lists or specific filter option structures.
