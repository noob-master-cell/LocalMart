// This component renders a home icon, typically used for navigation to the main or home page.
import React from "react";

/**
 * HomeIcon component.
 * @param {object} props - The component's props.
 * @param {string} [props.className="w-6 h-6"] - Optional CSS classes to apply to the SVG element.
 * @returns {JSX.Element} The SVG home icon.
 */
const HomeIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none" // The icon shape is not filled by default.
    viewBox="0 0 24 24" // Defines the SVG canvas dimensions.
    strokeWidth={1.5} // The thickness of the stroke.
    stroke="currentColor" // The stroke color inherits from the current text color.
    className={className} // Applies custom or default Tailwind CSS classes for styling.
  >
    {/* SVG path data defining the home shape. */}
    <path
      strokeLinecap="round" // Makes the ends of the lines rounded.
      strokeLinejoin="round" // Makes the corners where lines meet rounded.
      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5"
    />
  </svg>
);
export default HomeIcon;
