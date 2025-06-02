// project/src/components/Filters/SearchAndFilter/FilterChips.jsx
import React from "react";

const FilterChips = ({ hasActiveFilters, onClearAllFilters }) => {
  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="mt-4 flex justify-end">
      <button
        onClick={onClearAllFilters}
        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
      >
        Clear all filters
      </button>
    </div>
  );
};

export default React.memo(FilterChips);
