import React from "react";
import SearchIcon from "../../Icons/SearchIcon"; // Adjusted path for the SearchIcon

/**
 * @component SearchInput
 * @description A styled search input field with an icon.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} props.searchTerm - The current value of the search input.
 * @param {Function} props.onSearchChange - Callback function invoked when the input value changes. It receives the event object `e`.
 * @param {string} [props.placeholder="Search items..."] - Placeholder text for the input field.
 * @returns {JSX.Element} The search input component.
 */
const SearchInput = ({
  searchTerm,
  onSearchChange, // Expects the full event object `e`
  placeholder = "Search items...",
}) => {
  return (
    <div className="relative mb-4">
      {" "}
      {/* Container for relative positioning of the icon */}
      {/* Search Icon positioned inside the input field */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="h-5 w-5 text-gray-400" />
      </div>
      {/* The actual input field */}
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={onSearchChange} // Parent component will handle e.target.value
        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        aria-label={placeholder} // Accessibility: label for the search input
      />
    </div>
  );
};

// Memoize the component for performance, useful if parent re-renders frequently.
export default React.memo(SearchInput);
