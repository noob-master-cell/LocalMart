// This component renders a shopping bag icon, typically used for "buy" actions or marketplace sections.
import React from "react";

/**
 * ShoppingBagIcon component.
 * @returns {JSX.Element} The SVG shopping bag icon.
 */
const ShoppingBagIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none" // The icon shape is not filled by default.
    viewBox="0 0 24 24" // Defines the SVG canvas dimensions.
    strokeWidth={1.5} // The thickness of the stroke for the icon lines.
    stroke="currentColor" // The stroke color inherits from the current text color.
    className="w-6 h-6" // Default sizing using Tailwind CSS classes.
  >
    {/* SVG path data defining the shopping bag shape. */}
    <path
      strokeLinecap="round" // Makes the ends of the lines rounded.
      strokeLinejoin="round" // Makes the corners where lines meet rounded.
      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
    />
  </svg>
);
export default ShoppingBagIcon;
