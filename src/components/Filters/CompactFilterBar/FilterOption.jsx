import React from "react";

/**
 * @component FilterOption
 * @description A reusable button component for individual filter options within a filter bar.
 * It adapts its styling based on whether it's active and its specified type (e.g., 'status' or default chip).
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} props.label - The text label displayed on the button.
 * @param {boolean} props.isActive - Indicates whether this filter option is currently active.
 * @param {Function} props.onClick - Callback function invoked when the button is clicked. It receives the `value` prop.
 * @param {string} [props.type="button"] - The type of filter option, influencing styling (e.g., 'status', 'button').
 * @param {string} props.value - The value associated with this filter option, passed to `onClick`.
 * @returns {JSX.Element} A styled button for a filter option.
 */
const FilterOption = ({ label, isActive, onClick, type = "button", value }) => {
  let activeClasses = ""; // CSS classes for active state
  let inactiveClasses = ""; // CSS classes for inactive state
  let baseClasses = "text-xs font-medium transition-colors"; // Common base CSS classes

  // Apply type-specific styling
  if (type === "status") {
    // Styling for status filter buttons (typically wider, different padding)
    baseClasses += " py-2 px-3 rounded";
    activeClasses = "bg-indigo-600 text-white shadow-sm";
    inactiveClasses = "text-gray-600 hover:bg-gray-200";
  } else {
    // Default styling for quick filter chips (e.g., categories)
    baseClasses += " px-2.5 py-1 rounded-full";
    activeClasses = "bg-indigo-600 text-white";
    inactiveClasses = "bg-gray-100 text-gray-700 hover:bg-gray-200";
  }

  return (
    <button
      onClick={() => onClick(value)} // Pass the `value` to the onClick handler
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`} // Combine base and state-specific classes
      type="button" // Explicitly set button type for accessibility and behavior
      aria-pressed={isActive} // Accessibility: indicates if a toggle button is pressed
    >
      {label}
    </button>
  );
};

// Memoize the component for performance, as these options might be part of larger, frequently re-rendering lists.
export default React.memo(FilterOption);