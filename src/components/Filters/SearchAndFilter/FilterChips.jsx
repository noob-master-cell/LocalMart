import React from "react";

/**
 * @component FilterChips
 * @description Displays a "Clear all filters" button if any filters are active.
 * This component is typically used in conjunction with a filter interface
 * to provide users a quick way to reset their filter selections.
 *
 * @param {object} props - The properties passed to the component.
 * @param {boolean} props.hasActiveFilters - Indicates whether any filters are currently active.
 * If false, the component renders nothing.
 * @param {Function} props.onClearAllFilters - Callback function invoked when the "Clear all filters" button is clicked.
 * @returns {JSX.Element|null} The "Clear all filters" button if filters are active, otherwise null.
 */
const FilterChips = ({ hasActiveFilters, onClearAllFilters }) => {
  // If no filters are active, do not render the component.
  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="mt-4 flex justify-end">
      {" "}
      {/* Aligns the button to the right */}
      <button
        onClick={onClearAllFilters}
        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        aria-label="Clear all active filters"
      >
        Clear all filters
      </button>
    </div>
  );
};

// Memoize the component for performance optimization, preventing re-renders if props remain unchanged.
export default React.memo(FilterChips);
