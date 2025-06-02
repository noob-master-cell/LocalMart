// project/src/components/Filters/SearchAndFilter/SearchAndFilter.jsx
import React, { useState, useCallback } from "react";
import SearchInput from "./SearchInput";
import FilterSidebar from "./FilterSidebar";
import FilterChips from "./FilterChips";

const SearchAndFilter = ({
  onSearchChange: notifyParentSearchChange, // Renamed to avoid confusion with internal handler
  onFilterChange: notifyParentFilterChange, // Renamed
  categories = [], // Ensure "All Categories" is handled or added by parent if needed as first option
  showPriceFilter = false,
  showSortOptions = false,
  showStatusFilter = false,
  statusOptions = [], // Expects { label, value }
  className = "",
}) => {
  const [filters, setFilters] = useState({
    searchTerm: "",
    category: "",
    sortBy: "newest",
    status: "",
    priceRange: { min: "", max: "" },
  });

  // Handler for the SearchInput component
  const handleSearchInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setFilters((prev) => ({ ...prev, searchTerm: value }));
      notifyParentSearchChange(value); // Notify parent about search term change
    },
    [notifyParentSearchChange]
  );

  // Handler for filter updates from FilterSidebar (category, sortBy, status)
  const handleFilterUpdate = useCallback(
    (key, value) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      notifyParentFilterChange(newFilters);
    },
    [filters, notifyParentFilterChange]
  );

  // Handler for price range changes from FilterSidebar
  const handlePriceRangeChange = useCallback(
    (type, value) => {
      const newPriceRange = { ...filters.priceRange, [type]: value };
      const newFilters = { ...filters, priceRange: newPriceRange };
      setFilters(newFilters);
      notifyParentFilterChange(newFilters);
    },
    [filters, notifyParentFilterChange]
  );

  // Handler for clearing all filters from FilterChips
  const clearAllFilters = useCallback(() => {
    const clearedFilters = {
      searchTerm: filters.searchTerm, // Keep search term or clear it too? Original cleared it.
      // For now, let's assume original behavior: clear all except search term
      // If search term should also be cleared, set it to ""
      category: "",
      sortBy: "newest",
      status: "",
      priceRange: { min: "", max: "" },
    };
    // If you want to clear search term as well:
    // const clearedFiltersWithSearch = { ...clearedFilters, searchTerm: "" };
    // setFilters(clearedFiltersWithSearch);
    // notifyParentSearchChange(""); // Also notify parent about cleared search term
    // notifyParentFilterChange(clearedFiltersWithSearch);

    setFilters((prev) => ({
      ...prev, // keep search term by default if user wants to clear only filters
      category: "",
      sortBy: "newest",
      status: "",
      priceRange: { min: "", max: "" },
    }));
    // Notify parent with all filters state, including the potentially preserved searchTerm
    notifyParentFilterChange({
      searchTerm: filters.searchTerm,
      category: "",
      sortBy: "newest",
      status: "",
      priceRange: { min: "", max: "" },
    });
  }, [filters.searchTerm, notifyParentFilterChange]);
  // Original clearAllFilters in did clear searchTerm from its own state.
  // The parent was only notified via onFilterChange. Re-aligning:
  const clearAllFiltersRevised = useCallback(() => {
    const clearedState = {
      // This is the state for THIS component
      searchTerm: "",
      category: "",
      sortBy: "newest",
      status: "",
      priceRange: { min: "", max: "" },
    };
    setFilters(clearedState);
    notifyParentSearchChange(""); // Notify parent about cleared search
    notifyParentFilterChange(clearedState); // Notify parent about cleared filters
  }, [notifyParentSearchChange, notifyParentFilterChange]);

  const hasActiveFilters =
    filters.category ||
    filters.status ||
    filters.priceRange.min ||
    filters.priceRange.max ||
    filters.sortBy !== "newest"; // Search term activity is separate

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 sticky top-[64px] sm:top-[80px] z-10 ${className}`}
    >
      <SearchInput
        searchTerm={filters.searchTerm}
        onSearchChange={handleSearchInputChange}
      />
      <FilterSidebar
        filters={filters}
        categories={
          categories.length > 0 && !categories.includes("All Categories")
            ? ["All Categories", ...categories]
            : categories
        }
        statusOptions={statusOptions}
        showPriceFilter={showPriceFilter}
        showSortOptions={showSortOptions}
        showStatusFilter={showStatusFilter}
        onFilterUpdate={handleFilterUpdate}
        onPriceChange={handlePriceRangeChange}
      />
      <FilterChips
        hasActiveFilters={hasActiveFilters}
        onClearAllFilters={clearAllFiltersRevised}
      />
    </div>
  );
};

export default React.memo(SearchAndFilter);
