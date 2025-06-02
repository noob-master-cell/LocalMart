import React, { useState, useCallback, useEffect, useRef } from "react";
import FilterOption from "./FilterOption";

const CompactFilterBar = ({
  onFilterChange,
  categories = [],
  showStatusFilter = false,
  statusOptions = [],
  className = "",
  initialFilters = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    sortBy: "newest",
    status: "",
    ...initialFilters,
  });

  const dropdownRef = useRef(null);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, ...initialFilters }));
  }, [initialFilters]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterUpdate = useCallback(
    (key, value) => {
      const newValue = filters[key] === value ? "" : value;
      const updatedFilters = {
        ...filters,
        [key]: key === "sortBy" ? value : newValue,
      };
      setFilters(updatedFilters);
      onFilterChange?.(updatedFilters);
    },
    [filters, onFilterChange]
  );

  const handleSortByChange = useCallback(
    (e) => {
      const value = e.target.value;
      const updatedFilters = { ...filters, sortBy: value };
      setFilters(updatedFilters);
      onFilterChange?.(updatedFilters);
    },
    [filters, onFilterChange]
  );

  const clearAllFilters = useCallback(() => {
    const clearedFilters = {
      category: "",
      sortBy: "newest",
      status: "",
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  }, [onFilterChange]);

  const activeFilterCount = [
    filters.category,
    filters.status,
    filters.sortBy !== "newest" ? filters.sortBy : null,
  ].filter(Boolean).length;

  const quickCategories = categories.slice(0, 6).filter((cat) => cat !== "All");

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
          />
        </svg>
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {activeFilterCount}
          </span>
        )}
        <svg
          className={`ml-2 h-5 w-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                Filter Options
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {categories.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterUpdate("category", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories
                    .filter((cat) => cat !== "All")
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {showStatusFilter && statusOptions.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-md">
                  {statusOptions.map((statusOpt) => (
                    <FilterOption
                      key={statusOpt.value}
                      label={statusOpt.label}
                      value={statusOpt.value}
                      isActive={filters.status === statusOpt.value}
                      onClick={(value) => handleFilterUpdate("status", value)}
                      type="status"
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                value={filters.sortBy}
                onChange={handleSortByChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {quickCategories.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Quick Filters (Categories)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickCategories.map((category) => (
                    <FilterOption
                      key={category}
                      label={category}
                      value={category}
                      isActive={filters.category === category}
                      onClick={(value) => handleFilterUpdate("category", value)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                {activeFilterCount > 0
                  ? `${activeFilterCount} filter${
                      activeFilterCount !== 1 ? "s" : ""
                    } applied`
                  : "No filters applied"}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded border border-indigo-200 hover:border-indigo-300 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CompactFilterBar);
