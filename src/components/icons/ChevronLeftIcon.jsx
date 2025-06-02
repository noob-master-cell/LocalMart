// This component renders a chevron icon pointing to the left, often used for "previous" or "back" actions.
import React from "react";

/**
 * ChevronLeftIcon component.
 * @param {object} props - The component's props.
 * @param {string} [props.className="w-6 h-6"] - Optional CSS classes for styling the SVG.
 * @returns {JSX.Element} The SVG chevron-left icon.
 */
const ChevronLeftIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none" // The shape is not filled.
    viewBox="0 0 24 24" // Defines the SVG canvas size.
    strokeWidth={1.5} // The thickness of the stroke.
    stroke="currentColor" // Inherits color from the current text color.
    className={className} // Applies custom or default Tailwind CSS classes for sizing.
  >
    {/* SVG path data for the left-pointing chevron. */}
    <path
      strokeLinecap="round" // Makes the ends of the lines rounded.
      strokeLinejoin="round" // Makes the corners where lines meet rounded.
      d="M15.75 19.5L8.25 12l7.5-7.5" // Defines the chevron shape.
    />
  </svg>
);
export default ChevronLeftIcon;
