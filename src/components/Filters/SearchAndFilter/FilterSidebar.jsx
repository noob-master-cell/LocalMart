import React from "react";

/**
 * @component FilterSidebar
 * @description Renders a sidebar with various filter options such as category, status, price range, and sort order.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.filters - An object containing the current state of active filters (e.g., { category, sortBy, status, priceRange }).
 * @param {string[]} props.categories - An array of available category strings.
 * @param {object[]} props.statusOptions - An array of status options, each an object with `label` and `value`.
 * @param {boolean} props.showPriceFilter - Flag to control the visibility of the price range filter.
 * @param {boolean} props.showSortOptions - Flag to control the visibility of the sort options.
 * @param {boolean} props.showStatusFilter - Flag to control the visibility of the status filter.
 * @param {Function} props.onFilterUpdate - Callback function invoked when a filter value changes (key, value).
 * @param {Function} props.onPriceChange - Callback function invoked when a price range value changes (type: 'min' | 'max', value).
 * @returns {JSX.Element} The filter sidebar section.
 */
const FilterSidebar = ({
  filters, // Current filter state: { category, sortBy, status, priceRange }
  categories,
  statusOptions,
  showPriceFilter,
  showSortOptions,
  showStatusFilter,
  onFilterUpdate, // (key, value) => void
  onPriceChange, // (type: 'min' | 'max', value) => void
}) => {
  return (
    // Grid layout for filter sections, responsive columns
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Category Filter Section */}
      {categories.length > 0 && (
        <div>
          <label
            htmlFor="filter-category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) =>
              // If "All Categories" (empty value) is selected, pass empty string, otherwise pass selected value.
              onFilterUpdate(
                "category",
                e.target.value === "All Categories" || e.target.value === ""
                  ? ""
                  : e.target.value
              )
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {/* Dynamically render category options */}
            {categories.map((category) => (
              <option
                key={category}
                // Value for "All Categories" should be an empty string to signify no specific category filter.
                value={category === "All Categories" ? "" : category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status Filter Section (e.g., for lost/found items, item conditions) */}
      {showStatusFilter && statusOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          {/* Group of buttons for status options */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() =>
                  // Toggle behavior: if current status is clicked, deselect it (set to empty string).
                  onFilterUpdate(
                    "status",
                    filters.status === status.value ? "" : status.value
                  )
                }
                className={`flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  filters.status === status.value
                    ? "bg-indigo-600 text-white shadow" // Active state
                    : "text-gray-600 hover:bg-gray-200" // Inactive state
                }`}
                aria-pressed={filters.status === status.value} // Accessibility for toggle buttons
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Filter Section */}
      {showPriceFilter && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range
          </label>
          <div className="flex space-x-2">
            {/* Minimum Price Input */}
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange.min}
              onChange={(e) => onPriceChange("min", e.target.value)}
              className="w-1/2 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0" // Price cannot be negative
              aria-label="Minimum price"
            />
            {/* Maximum Price Input */}
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange.max}
              onChange={(e) => onPriceChange("max", e.target.value)}
              className="w-1/2 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0" // Max price also cannot be negative (though usually higher than min)
              aria-label="Maximum price"
            />
          </div>
        </div>
      )}

      {/* Sort Options Section */}
      {showSortOptions && (
        <div>
          <label
            htmlFor="filter-sortby"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Sort by
          </label>
          <select
            id="filter-sortby"
            value={filters.sortBy}
            onChange={(e) => onFilterUpdate("sortBy", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {/* Standard sort options */}
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">A-Z</option>
            {/* Conditional sort options for price (if price filter is shown) */}
            {showPriceFilter && (
              <>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </>
            )}
          </select>
        </div>
      )}
    </div>
  );
};

// Memoize for performance, as filter options might not change frequently.
export default React.memo(FilterSidebar);
