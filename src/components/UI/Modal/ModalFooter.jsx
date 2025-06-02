// This component renders the footer section of a modal.
// It's designed to hold action buttons (e.g., Save, Cancel, OK).
import React from "react";

/**
 * ModalFooter component.
 *
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The content to be rendered within the footer, typically buttons.
 * @param {string} [props.className=""] - Optional additional CSS classes for custom styling of the footer.
 * @returns {JSX.Element|null} The rendered modal footer, or null if no children are provided.
 */
const ModalFooter = ({ children, className = "" }) => {
  // If no children are provided, don't render the footer.
  if (!children) return null;

  return (
    // Sticky footer that stays at the bottom of the modal content.
    // `flex justify-end` aligns children (buttons) to the right.
    <div
      className={`sticky bottom-0 p-3 sm:p-4 border-t bg-white rounded-b-lg flex justify-end space-x-3 ${className}`}
    >
      {children}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders if its props (children, className) haven't changed.
export default React.memo(ModalFooter);
