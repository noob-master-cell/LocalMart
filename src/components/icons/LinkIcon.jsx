// This component renders a link icon, often used to represent hyperlinks or sharing actions.
import React from "react";

/**
 * LinkIcon component.
 * @param {object} props - The component's props.
 * @param {string} [props.className="w-5 h-5"] - Optional CSS classes for styling the SVG.
 * @returns {JSX.Element} The SVG link icon.
 */
const LinkIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className} // Applies custom or default Tailwind CSS classes for sizing.
    fill="none" // The icon shape is not filled by default.
    stroke="currentColor" // The stroke color inherits from the current text color.
    viewBox="0 0 24 24" // Defines the SVG canvas dimensions.
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* SVG path data defining the link chain shape. */}
    <path
      strokeLinecap="round" // Makes the ends of the lines rounded.
      strokeLinejoin="round" // Makes the corners where lines meet rounded.
      strokeWidth={2} // The thickness of the stroke.
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
);
export default LinkIcon;
