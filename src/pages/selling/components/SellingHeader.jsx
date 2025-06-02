// src/pages/selling/components/SellingHeader.jsx
// This component renders the header for the user's "Items for Sale" page.
// It displays a title, a brief description, the current global search term (if any)
// with an option to clear it, and a button to list a new item.

import React from "react";
// Icon for the "List New Item" button.
import PlusCircleIcon from "./../../../components/icons/PlusCircleIcon.jsx";
// SVG icons for search and clear search could also be imported or defined directly.

/**
 * SellingHeader component.
 * @param {object} props - The component's props.
 * @param {object|null} props.user - The current authenticated user. Used to conditionally show the "List New Item" button.
 * @param {string} props.globalSearchTerm - The current global search term active in the application.
 * @param {Function} props.onClearGlobalSearch - Callback function to clear the global search term.
 * @param {Function} props.onOpenAddModal - Callback function to open the modal for adding a new item.
 */
const SellingHeader = ({
  user,
  globalSearchTerm,
  onClearGlobalSearch,
  onOpenAddModal,
}) => {
  return (
    // Flex container for layout, responsive (column on small screens, row on larger).
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
      {/* Left side: Title and search term display */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Your Items for Sale
        </h2>
        <p className="text-gray-600 mt-1">Manage your marketplace listings</p>

        {/* Display the current global search term if it's active */}
        {globalSearchTerm && (
          <div className="mt-3 inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1">
            {/* Search Icon */}
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="text-sm text-blue-800">
              Searching: <strong>"{globalSearchTerm}"</strong>
            </span>
            {/* Button to clear the global search term */}
            <button
              onClick={onClearGlobalSearch}
              className="text-blue-600 hover:text-blue-800"
              title="Clear search"
            >
              {/* Clear Search Icon (X) */}
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Right side: "List New Item" button, shown only if a user is logged in */}
      {user && (
        <button
          onClick={onOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md flex items-center space-x-2 transition-all hover:shadow-lg"
        >
          <PlusCircleIcon /> {/* Add icon */}
          <span>List New Item</span>
        </button>
      )}
    </div>
  );
};

export default SellingHeader;