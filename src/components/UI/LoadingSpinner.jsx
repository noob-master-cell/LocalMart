// This component displays a visual loading spinner with an optional message.
// It's used to indicate that an operation is in progress.
import React from "react";

/**
 * LoadingSpinner component.
 *
 * @param {object} props - Component props.
 * @param {string} [props.message="Loading..."] - Text message to display below the spinner.
 * @param {string} [props.size="large"] - Size of the spinner ('small', 'medium', 'large').
 * @param {string} [props.className=""] - Additional CSS classes for the container div.
 * @returns {JSX.Element} The loading spinner component.
 */
const LoadingSpinner = ({
  message = "Loading...",
  size = "large", // Default size.
  className = "",
}) => {
  // Mapping of size prop to Tailwind CSS height/width classes.
  const sizeClasses = {
    small: "h-8 w-8",
    medium: "h-12 w-12",
    large: "h-16 w-16",
  };

  return (
    <div
      className={`flex flex-col justify-center items-center py-12 ${className}`} // Centering and padding.
      role="status" // ARIA role for status messages.
      aria-live="polite" // ARIA live region politeness.
    >
      {/* The spinner element with animation and border styles. */}
      <div
        className={`animate-spin rounded-full border-t-4 border-b-4 border-indigo-600 ${sizeClasses[size]}`}
        aria-label="Loading" // ARIA label for the spinner itself.
      />
      {/* The loading message displayed below the spinner. */}
      <p className="text-gray-600 mt-4 text-center">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
