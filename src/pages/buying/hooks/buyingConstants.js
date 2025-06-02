// This file defines constants specifically for the "buying" feature.
// This helps in centralizing configuration and making it easier to manage,
// particularly for UI elements like category filters.

// Array of categories available for items being sold (and thus, bought).
// These categories are typically used in dropdowns or filter options on the buying page.
export const BUYING_CATEGORIES = [
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
  "Other", // A general category for items that don't fit elsewhere.
];

// Example: Default filter settings for the buying page.
// This could be used to initialize the filter state in the `useBuyingData` hook
// or the `BuyingSection` component if more complex defaults are needed.
// export const DEFAULT_BUYING_FILTERS = {
//   category: "", // Default to no category filter.
//   sortBy: "newest", // Default sort order (could also be 'relevance' if implemented).
//   priceRange: { min: "", max: "" }, // Default empty price range.
// };
