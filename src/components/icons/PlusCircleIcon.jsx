// This component renders a plus sign (+) inside a circle, often used for "add" or "create new" actions.
import React from "react";

/**
 * PlusCircleIcon component.
 * @returns {JSX.Element} The SVG plus-in-circle icon.
 */
const PlusCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none" // The icon shapes are not filled by default.
    viewBox="0 0 24 24" // Defines the SVG canvas dimensions.
    strokeWidth={1.5} // The thickness of the stroke for the lines.
    stroke="currentColor" // The stroke color inherits from the current text color.
    className="w-6 h-6" // Default sizing using Tailwind CSS classes.
  >
    {/* SVG path data for the plus sign and the surrounding circle. */}
    <path
      strokeLinecap="round" // Makes the ends of the lines rounded.
      strokeLinejoin="round" // Makes the corners where lines meet rounded.
      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" // Defines the plus and circle shapes.
    />
  </svg>
);
export default PlusCircleIcon;
