import React, { useState, useCallback } from "react";
import SearchInput from "./SearchInput";
import FilterSidebar from "./FilterSidebar";
import FilterChips from "./FilterChips";

/**
 * @component SearchAndFilter
 * @description A comprehensive component that combines a search input with a filter sidebar and filter chips.
 * It manages the overall filter state and notifies parent components of changes.
 *
 * @param {object} props - The properties passed to the component.
 * @param {Function} props.onSearchChange - Callback invoked when the search term changes. Renamed internally to `notifyParentSearchChange`.
 * @param {Function} props.onFilterChange - Callback invoked when any filter (category, sort, status, price) changes. Renamed internally to `notifyParentFilterChange`.
 * @param {string[]} [props.categories=[]] - Array of category strings for the filter sidebar.
 * @param {boolean} [props.showPriceFilter=false] - Whether to show the price filter in the sidebar.
 * @param {boolean} [props.showSortOptions=false] - Whether to show sort options in the sidebar.
 * @param {boolean} [props.showStatusFilter=false] - Whether to show status filter options in the sidebar.
 * @param {object[]} [props.statusOptions=[]] - Array of status options (each with `label` and `value`).
 * @param {string} [props.className=""] - Additional CSS classes for the main container.
 * @returns {JSX.Element} The search and filter component.
 */
const SearchAndFilter = ({
  onSearchChange: notifyParentSearchChange, // Renamed to avoid conflict with internal handler
  onFilterChange: notifyParentFilterChange, // Renamed for clarity
  categories = [],
  showPriceFilter = false,
  showSortOptions = false,
  showStatusFilter = false,
  statusOptions = [], // Expects { label, value }
  className = "",
}) => {
  // Internal state for all filters including search term
  const [filters, setFilters] = useState({
    searchTerm: "",
    category: "",
    sortBy: "newest", // Default sort option
    status: "",
    priceRange: { min: "", max: "" },
  });

  /**
   * Handles changes from the SearchInput component.
   * Updates internal search term and notifies the parent.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleSearchInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setFilters((prevFilters) => ({ ...prevFilters, searchTerm: value }));
      notifyParentSearchChange(value); // Notify parent of the search term change
    },
    [notifyParentSearchChange] // Dependency: parent's search change handler
  );

  /**
   * Handles filter updates from FilterSidebar (e.g., category, sortBy, status).
   * Updates internal filter state and notifies the parent.
   * @param {string} key - The filter key (e.g., 'category', 'sortBy').
   * @param {string} value - The new filter value.
   */
  const handleFilterUpdate = useCallback(
    (key, value) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      notifyParentFilterChange(newFilters); // Notify parent with the complete new filter state
    },
    [filters, notifyParentFilterChange] // Dependencies: current filters and parent's filter change handler
  );

  /**
   * Handles price range changes from FilterSidebar.
   * Updates internal price range state and notifies the parent.
   * @param {'min' | 'max'} type - The type of price bound ('min' or 'max').
   * @param {string} value - The new price value.
   */
  const handlePriceRangeChange = useCallback(
    (type, value) => {
      const newPriceRange = { ...filters.priceRange, [type]: value };
      const newFilters = { ...filters, priceRange: newPriceRange };
      setFilters(newFilters);
      notifyParentFilterChange(newFilters); // Notify parent with the complete new filter state
    },
    [filters, notifyParentFilterChange] // Dependencies
  );

  /**
   * Clears all filters (category, sortBy, status, priceRange) and the search term.
   * Resets internal state and notifies the parent of cleared search and filters.
   * This is the revised version that clears the search term as well.
   */
  const clearAllFiltersRevised = useCallback(() => {
    const clearedState = { // Defines the state to reset to
      searchTerm: "",
      category: "",
      sortBy: "newest", // Reset to default sort
      status: "",
      priceRange: { min: "", max: "" },
    };
    setFilters(clearedState); // Update internal state
    notifyParentSearchChange(""); // Notify parent about cleared search term
    notifyParentFilterChange(clearedState); // Notify parent about cleared filters
  }, [notifyParentSearchChange, notifyParentFilterChange]); // Dependencies

  // Determine if any filters (excluding search term) are active
  const hasActiveFilters =
    filters.category ||
    filters.status ||
    filters.priceRange.min ||
    filters.priceRange.max ||
    filters.sortBy !== "newest"; // Consider default sort as 'not active'

  // Prepare categories for FilterSidebar, ensuring "All Categories" is an option if not already present.
  const sidebarCategories = useMemo(() => {
    // If categories are provided and "All Categories" is not the first item (or present at all), prepend it.
    // Assuming "All Categories" corresponds to an empty string filter value.
    if (categories.length > 0 && !categories.some(cat => cat === "All Categories" || cat === "")) {
        return ["All Categories", ...categories];
    }
    // If "All Categories" is already there or categories is empty, use as is.
    return categories;
  }, [categories]);


  return (
    <div
      // Sticky positioning for the filter bar
      className={`bg-white rounded-lg shadow-md p-4 sticky top-[64px] sm:top-[80px] z-10 ${className}`}
    >
      {/* Search Input Component */}
      <SearchInput
        searchTerm={filters.searchTerm}
        onSearchChange={handleSearchInputChange}
      />
      {/* Filter Sidebar Component */}
      <FilterSidebar
        filters={filters} // Pass current filter state
        categories={sidebarCategories}
        statusOptions={statusOptions}
        showPriceFilter={showPriceFilter}
        showSortOptions={showSortOptions}
        showStatusFilter={showStatusFilter}
        onFilterUpdate={handleFilterUpdate} // Pass update handlers
        onPriceChange={handlePriceRangeChange}
      />
      {/* Filter Chips Component (e.g., "Clear All") */}
      <FilterChips
        hasActiveFilters={hasActiveFilters}
        onClearAllFilters={clearAllFiltersRevised} // Pass revised clear all handler
      />
    </div>
  );
};

export default React.memo(SearchAndFilter);