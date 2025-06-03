import React from "react";
import { PlusCircleIcon } from "../../../components/Icons";

/**
 * @component SellingHeader
 * @description Header for the "Your Items for Sale" page. Displays title, description,
 * active global search term with a clear option, and a button to list a new item.
 *
 * @param {object} props - The component's props.
 * @param {object|null} props.user - The current authenticated user.
 * @param {string} props.globalSearchTerm - The current global search term.
 * @param {Function} props.onClearGlobalSearch - Callback to clear the global search.
 * @param {Function} props.onOpenAddModal - Callback to open the modal for adding a new item.
 */
const SellingHeader = ({
  user,
  globalSearchTerm,
  onClearGlobalSearch,
  onOpenAddModal,
}) => {
  return (
    <div className="mb-4 sm:mb-6">
      {" "}
      {/* Reduced bottom margin */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left side: Title and search term display */}
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Your Items for Sale
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
            {" "}
            {/* Reduced top margin and font size */}
            Manage your marketplace listings.
          </p>

          {globalSearchTerm && (
            <div className="mt-2 inline-flex items-center space-x-1.5 bg-sky-50 border border-sky-200 rounded-md px-2 py-1 text-xs">
              {" "}
              {/* Adjusted padding and spacing */}
              <svg // Search Icon
                className="w-3.5 h-3.5 text-sky-600"
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
              <span className="text-sky-800">
                Filtered by: <strong>"{globalSearchTerm}"</strong>
              </span>
              <button
                onClick={onClearGlobalSearch}
                className="text-sky-500 hover:text-sky-700"
                title="Clear global search filter"
              >
                <svg // Clear Search Icon (X)
                  className="w-3.5 h-3.5"
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

        {/* Right side: "List New Item" button */}
        {user && (
          <button
            onClick={onOpenAddModal}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md flex items-center justify-center space-x-2 transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm"
          >
            <PlusCircleIcon className="w-5 h-5" /> {/* Icon size consistent */}
            <span>List New Item</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SellingHeader;
