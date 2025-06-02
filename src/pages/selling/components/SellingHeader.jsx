// src/pages/selling/components/SellingHeader.jsx

import React from "react";
import PlusCircleIcon from "./../../../components/icons/PlusCircleIcon.jsx"; // Adjust path as needed
// You might also need a SearchIcon or XCircleIcon if you directly handle parts of global search display here

const SellingHeader = ({
  user, // To conditionally enable/disable the "List New Item" button or for other UI logic
  globalSearchTerm,
  onClearGlobalSearch, // Callback to clear the global search term
  onOpenAddModal, // Callback to open the modal for adding a new item
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Your Items for Sale
        </h2>
        <p className="text-gray-600 mt-1">Manage your marketplace listings</p>
        {globalSearchTerm && (
          <div className="mt-3 inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1">
            {/* You might want a SearchIcon here */}
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
            <button
              onClick={onClearGlobalSearch}
              className="text-blue-600 hover:text-blue-800"
              title="Clear search"
            >
              {/* You might want an XCircleIcon here */}
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
      {user && ( // Only show add button if user is logged in
        <button
          onClick={onOpenAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md flex items-center space-x-2 transition-all hover:shadow-lg"
        >
          <PlusCircleIcon />
          <span>List New Item</span>
        </button>
      )}
    </div>
  );
};

export default SellingHeader;
