// project/src/components/Filters/SearchAndFilter/FilterSidebar.jsx
import React from "react";

const FilterSidebar = ({
  filters, // { category, sortBy, status, priceRange }
  categories,
  statusOptions,
  showPriceFilter,
  showSortOptions,
  showStatusFilter,
  onFilterUpdate, // (key, value) => void
  onPriceChange, // (type: 'min' | 'max', value) => void
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Category Filter */}
      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) =>
              onFilterUpdate(
                "category",
                e.target.value === "All" ? "" : e.target.value
              )
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {/* Assuming 'All Categories' is the first, often default, option in your categories array or handled by parent */}
            {/* <option value="">All Categories</option> */}
            {categories.map((category) => (
              <option
                key={category}
                value={category === "All Categories" ? "" : category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status Filter */}
      {showStatusFilter && statusOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() =>
                  onFilterUpdate(
                    "status",
                    filters.status === status.value ? "" : status.value
                  )
                }
                className={`flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  filters.status === status.value
                    ? "bg-indigo-600 text-white shadow"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      {showPriceFilter && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange.min}
              onChange={(e) => onPriceChange("min", e.target.value)}
              className="w-1/2 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange.max}
              onChange={(e) => onPriceChange("max", e.target.value)}
              className="w-1/2 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
            />
          </div>
        </div>
      )}

      {/* Sort Options */}
      {showSortOptions && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort by
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterUpdate("sortBy", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">A-Z</option>
            {showPriceFilter && ( // Conditionally show price sort options
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

export default React.memo(FilterSidebar);
