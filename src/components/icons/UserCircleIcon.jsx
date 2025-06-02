// This component renders a user icon within a circle, often used for profiles or user-related actions.
import React from "react";

/**
 * UserCircleIcon component.
 * @param {object} props - The component's props.
 * @param {string} [props.className="w-6 h-6"] - Optional CSS classes for styling the SVG.
 * @returns {JSX.Element} The SVG icon.
 */
const UserCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none" // No fill for the shapes.
    viewBox="0 0 24 24" // Defines the SVG canvas dimensions.
    strokeWidth={1.5} // Stroke thickness for the icon lines.
    stroke="currentColor" // Inherits color from text color by default.
    className={className} // Applies custom or default Tailwind CSS classes.
  >
    {/* Path data for the user silhouette and the surrounding circle. */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
export default UserCircleIcon;
