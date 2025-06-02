// This component renders the header for the Lost & Found section.
// It includes the section title, item count, global search term display (if active),
// status toggle buttons (Lost/Found), and a button to post a new L&F item (conditional on user login).

import React from "react";
// Icons used in the header.
import PlusCircleIcon from "./../../../components/icons/PlusCircleIcon.jsx";
import UserCircleIcon from "./../../../components/icons/UserCircleIcon.jsx";
// import SearchIcon from '../../../../components/icons/SearchIcon.jsx'; // If displaying global search icon here

/**
 * LostFoundHeader component.
 *
 * @param {object} props - The component's props.
 * @param {number} props.itemCount - The number of items currently displayed (after filtering).
 * @param {string} props.globalSearchTerm - The active global search term.
 * @param {Function} props.onClearGlobalSearch - Callback to clear the global search.
 * @param {object} props.filters - Current filter state (specifically `filters.status` is used here).
 * @param {Function} props.onFilterChange - Callback to update filters (used for status toggle).
 * @param {Array<object>} props.statusOptions - Options for the status toggle (e.g., [{value: 'lost', label: 'Lost Items'}, ...]).
 * @param {Function} props.onOpenAddModal - Callback to open the modal for adding a new L&F item.
 * @param {object|null} props.user - The currently authenticated user.
 * @param {Function} props.navigateToAuth - Function to navigate to the authentication page.
 */
const LostFoundHeader = ({
  itemCount,
  globalSearchTerm,
  onClearGlobalSearch,
  filters,
  onFilterChange,
  statusOptions,
  onOpenAddModal,
  user,
  navigateToAuth,
}) => {
  // Determine the label for the current section based on the active status filter.
  // const currentSectionLabel =
  //   statusOptions.find((opt) => opt.value === filters.status)?.label || "Items";

  return (
    // Flex container for responsive layout.
    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
      {/* Left side: Title, item count, and global search term display. */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 inline-flex items-center">
          Lost & Found
          {/* Display item count if there are items. */}
          {itemCount > 0 && (
            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          )}
        </h2>
        {/* Display global search term if active. */}
        {globalSearchTerm && (
          <div className="flex items-center text-xs text-blue-600 mt-1">
            {/* Search Icon (inline SVG as an example) */}
            <svg
              className="w-3 h-3 mr-1"
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
            <span>Searching: "{globalSearchTerm}"</span>
            {/* Button to clear global search. */}
            <button
              onClick={onClearGlobalSearch}
              className="ml-1 text-blue-700 hover:text-blue-800"
              title="Clear search"
            >
              &times; {/* Simple 'X' for clear */}
            </button>
          </div>
        )}
      </div>

      {/* Right side: Status toggle and Add/Login button. */}
      <div className="flex items-center space-x-2">
        {/* Status Toggle Buttons (Lost/Found) */}
        <div className="bg-gray-100 rounded-lg overflow-hidden flex text-sm">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              // Update the 'status' filter when a button is clicked.
              onClick={() =>
                onFilterChange({ ...filters, status: option.value })
              }
              className={`px-3 py-1.5 font-medium transition-colors ${
                filters.status === option.value
                  ? "bg-indigo-600 text-white shadow-sm" // Active state
                  : "text-gray-700 hover:bg-gray-200" // Inactive state
              }`}
            >
              {option.label} {/* e.g., "Lost Items" or "Found Items" */}
            </button>
          ))}
        </div>

        {/* Add New Item Button (conditional on user login) */}
        {user ? ( // If user is logged in, show "Post" button.
          <button
            onClick={onOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg flex items-center shadow-sm hover:shadow-md transition-all"
            title={`Post ${filters.status === "lost" ? "Lost" : "Found"} Item`}
          >
            <PlusCircleIcon className="w-5 h-5" />
            {/* Screen reader only text, visible on larger screens */}
            <span className="sr-only sm:not-sr-only sm:ml-1 sm:text-sm">
              Post
            </span>
          </button>
        ) : (
          // If user is not logged in, show "Login" button.
          <button
            onClick={() => navigateToAuth("login")} // Navigate to login page.
            className="bg-orange-500 hover:bg-orange-600 text-white p-1.5 rounded-lg flex items-center shadow-sm hover:shadow-md transition-all"
            title="Login to Post"
          >
            <UserCircleIcon className="w-5 h-5" />
            <span className="sr-only sm:not-sr-only sm:ml-1 sm:text-sm">
              Login
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LostFoundHeader;
