// src/pages/lostfound/hooks/lostFoundConstants.js

export const LOSTFOUND_CATEGORIES = [
  "Personal Belongings",
  "Electronics",
  "Keys",
  "Pets",
  "Documents",
  "Bags & Luggage",
  "Wallets & Purses",
  "Jewelry",
  "Other",
];

export const STATUS_OPTIONS = [
  { value: "lost", label: "Lost Items" },
  { value: "found", label: "Found Items" },
];

// You might also want to define default filters here, e.g.:
// export const DEFAULT_LOSTFOUND_FILTERS = {
//   category: "",
//   sortBy: "newest",
//   status: "lost", // Default to showing "lost" items
// };

// ITEM_STATUS constants from src/config/constants.js are general,
// but if you had L&F specific status values beyond 'lost'/'found', they could go here.
// However, your STATUS_OPTIONS already define these.
