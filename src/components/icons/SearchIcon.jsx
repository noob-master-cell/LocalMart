// This component renders a magnifying glass icon, commonly used for search functionality.
import React from "react";

/**
 * SearchIcon component.
 * @returns {JSX.Element} The SVG search icon.
 */
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none" // The icon is not filled by default.
    viewBox="0 0 24 24" // Defines the SVG canvas dimensions.
    strokeWidth={1.5} // The thickness of the stroke.
    stroke="currentColor" // The stroke color inherits from the current text color.
    className="w-6 h-6" // Default sizing using Tailwind CSS classes.
  >
    {/* SVG path data for the magnifying glass shape. */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);
export default SearchIcon;
