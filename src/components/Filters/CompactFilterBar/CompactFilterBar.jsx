import React, { useState, useCallback, useEffect, useRef } from "react";
import FilterOption from "./FilterOption"; // Component for individual filter buttons/chips

/**
 * @component CompactFilterBar
 * @description A compact, dropdown-based filter bar for selecting categories, sort order, and status.
 * It's designed to be space-efficient and provides quick filter options.
 *
 * @param {object} props - The properties passed to the component.
 * @param {Function} [props.onFilterChange] - Callback function invoked when any filter value changes. Receives an object with all current filter values.
 * @param {string[]} [props.categories=[]] - Array of category strings. The first 6 (excluding "All") are used for quick filters.
 * @param {boolean} [props.showStatusFilter=false] - Flag to control the visibility of the status filter section.
 * @param {object[]} [props.statusOptions=[]] - Array of status options, each an object with `label` and `value`.
 * @param {string} [props.className=""] - Additional CSS classes for the main container.
 * @param {object} [props.initialFilters={}] - Initial filter values to set when the component mounts or `initialFilters` prop changes.
 * @returns {JSX.Element} The compact filter bar component.
 */
const CompactFilterBar = ({
  onFilterChange,
  categories = [],
  showStatusFilter = false,
  statusOptions = [],
  className = "",
  initialFilters = {}, // Allows setting filters externally
}) => {
  const [isOpen, setIsOpen] = useState(false); // Controls dropdown visibility
  // Internal state for all filter values
  const [filters, setFilters] = useState({
    category: "",
    sortBy: "newest", // Default sort option
    status: "",
    ...initialFilters, // Spread initial filters
  });

  const dropdownRef = useRef(null); // Ref for the dropdown container to detect outside clicks

  // Effect to update internal filters if `initialFilters` prop changes
  useEffect(() => {
    setFilters((prevFilters) => ({ ...prevFilters, ...initialFilters }));
  }, [initialFilters]);

  // Effect to handle clicks outside the dropdown to close it
  useEffect(() => {
    /**
     * Closes the dropdown if a click occurs outside of it.
     * @param {MouseEvent} event - The mousedown event.
     */
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false); // Close dropdown
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside); // Cleanup listener
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  /**
   * Handles updates to filter values (category, status).
   * Toggles category/status selection or sets sortBy directly.
   * Notifies parent component of the change.
   * @param {string} key - The filter key (e.g., 'category', 'status', 'sortBy').
   * @param {string} value - The new filter value.
   */
  const handleFilterUpdate = useCallback(
    (key, value) => {
      // For category and status, clicking an active filter deselects it (toggles).
      // For sortBy, it always sets the new value.
      const newValue = (key === "category" || key === "status") && filters[key] === value ? "" : value;
      const updatedFilters = {
        ...filters,
        [key]: newValue,
      };
      setFilters(updatedFilters);
      onFilterChange?.(updatedFilters); // Notify parent
    },
    [filters, onFilterChange] // Dependencies
  );

  /**
   * Handles changes to the sortBy select dropdown.
   * Updates internal sortBy state and notifies the parent.
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The select change event.
   */
  const handleSortByChange = useCallback(
    (e) => {
      const value = e.target.value;
      const updatedFilters = { ...filters, sortBy: value };
      setFilters(updatedFilters);
      onFilterChange?.(updatedFilters); // Notify parent
    },
    [filters, onFilterChange] // Dependencies
  );

  /**
   * Clears all active filters and resets them to default values.
   * Notifies the parent component of the change.
   */
  const clearAllFilters = useCallback(() => {
    const clearedFilters = {
      category: "",
      sortBy: "newest", // Reset to default sort
      status: "",
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters); // Notify parent
  }, [onFilterChange]); // Dependency

  // Calculate the number of active filters (excluding default sortBy)
  const activeFilterCount = [
    filters.category,
    filters.status,
    filters.sortBy !== "newest" ? filters.sortBy : null, // Count sortBy only if not default
  ].filter(Boolean).length; // Filter out null/empty values and count

  // Prepare categories for quick filter chips (first 6, excluding "All" if present)
  const quickCategories = categories.slice(0, 6).filter((cat) => cat !== "All");

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Button to toggle the filter dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-expanded={isOpen}
        aria-controls="compact-filter-dropdown"
      >
        {/* Filter icon */}
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
          />
        </svg>
        Filters
        {/* Badge showing active filter count */}
        {activeFilterCount > 0 && (
          <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {activeFilterCount}
          </span>
        )}
        {/* Dropdown arrow icon, rotates when open */}
        <svg
          className={`ml-2 h-5 w-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Filter Dropdown Content */}
      {isOpen && (
        <div
          id="compact-filter-dropdown"
          className="absolute left-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="compact-filter-heading"
        >
          <div className="p-4 space-y-4">
            {/* Dropdown Header: Title and Clear All button */}
            <div className="flex items-center justify-between">
              <h3 id="compact-filter-heading" className="text-sm font-medium text-gray-900">
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

            {/* Category Filter Select */}
            {categories.length > 0 && (
              <div>
                <label htmlFor="compact-filter-category" className="block text-xs font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="compact-filter-category"
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterUpdate("category", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {/* Filter out "All" from category list if it's meant as a placeholder for the empty value */}
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

            {/* Status Filter Options */}
            {showStatusFilter && statusOptions.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Status
                </label>
                {/* Grid of status filter buttons */}
                <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-md">
                  {statusOptions.map((statusOpt) => (
                    <FilterOption
                      key={statusOpt.value}
                      label={statusOpt.label}
                      value={statusOpt.value}
                      isActive={filters.status === statusOpt.value}
                      onClick={(value) => handleFilterUpdate("status", value)}
                      type="status" // Specific type for styling FilterOption
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sort By Select */}
            <div>
              <label htmlFor="compact-filter-sortby" className="block text-xs font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                id="compact-filter-sortby"
                value={filters.sortBy}
                onChange={handleSortByChange} // Use specific handler for sort
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">A-Z</option>
                {/* Price sort options (could be conditional based on `showPriceFilter` if applicable here) */}
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Quick Filter Chips for Categories */}
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
                      // Default type for FilterOption styling (button/chip)
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Dropdown Footer: Applied filter count and Done button */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                {activeFilterCount > 0
                  ? `${activeFilterCount} filter${
                      activeFilterCount !== 1 ? "s" : "" // Pluralize 'filter'
                    } applied`
                  : "No filters applied"}
              </div>
              <button
                onClick={() => setIsOpen(false)} // Close dropdown on "Done"
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