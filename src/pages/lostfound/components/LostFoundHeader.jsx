// src/pages/lostfound/components/LostFoundHeader.jsx

import React from "react";
// Assuming icons are in a shared components directory
import PlusCircleIcon from "./../../../components/icons/PlusCircleIcon.jsx"; // Adjust path as needed
import UserCircleIcon from "./../../../components/icons/UserCircleIcon.jsx"; // Adjust path as needed
// import SearchIcon from '../../../../components/icons/SearchIcon.jsx'; // If displaying global search here

const LostFoundHeader = ({
  itemCount, // Number of processed items to display
  globalSearchTerm,
  onClearGlobalSearch,
  filters, // Current filters object { status, category, sortBy }
  onFilterChange, // Callback to update filters, specifically the 'status' here
  statusOptions, // Array of { value: 'lost', label: 'Lost Items' }, { value: 'found', label: 'Found Items' }
  onOpenAddModal, // Callback to open the modal for adding a new L&F item
  user, // Current authenticated user
  navigateToAuth, // Function to navigate to auth page if user is not logged in
}) => {
  const currentSectionLabel =
    statusOptions.find((opt) => opt.value === filters.status)?.label || "Items";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
      <div>
        <h2 className="text-xl font-bold text-gray-800 inline-flex items-center">
          Lost & Found
          {itemCount > 0 && ( // Display count if there are items
            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          )}
        </h2>
        {globalSearchTerm && (
          <div className="flex items-center text-xs text-blue-600 mt-1">
            {/* <SearchIcon className="w-3 h-3 mr-1" /> */}
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
            <button
              onClick={onClearGlobalSearch}
              className="ml-1 text-blue-700 hover:text-blue-800"
              title="Clear search"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Status Toggle Buttons (Lost/Found) */}
        <div className="bg-gray-100 rounded-lg overflow-hidden flex text-sm">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                onFilterChange({ ...filters, status: option.value })
              }
              className={`px-3 py-1.5 font-medium transition-colors ${
                filters.status === option.value
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.label} {/* e.g., "Lost Items" or "Found Items" */}
            </button>
          ))}
        </div>

        {/* Add New Item Button (conditional on user login) */}
        {user ? (
          <button
            onClick={onOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg flex items-center shadow-sm hover:shadow-md transition-all"
            title={`Post ${filters.status === "lost" ? "Lost" : "Found"} Item`}
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span className="sr-only sm:not-sr-only sm:ml-1 sm:text-sm">
              Post
            </span>
          </button>
        ) : (
          <button
            onClick={() => navigateToAuth("login")}
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
