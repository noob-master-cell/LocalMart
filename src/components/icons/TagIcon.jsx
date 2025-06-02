// This component renders a tag icon, often used to represent pricing, categories, or selling.
import React from "react";

/**
 * TagIcon component.
 * @returns {JSX.Element} The SVG tag icon.
 */
const TagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none" // The shape is not filled by default.
    viewBox="0 0 24 24" // Defines the SVG canvas dimensions.
    strokeWidth={1.5} // The thickness of the stroke.
    stroke="currentColor" // Inherits color from the current text color.
    className="w-6 h-6" // Default sizing using Tailwind CSS.
  >
    {/* Path for the main tag shape. */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
    />
    {/* Path for the small circle (hole) in the tag. */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 6h.008v.008H6V6z"
    />
  </svg>
);
export default TagIcon;
