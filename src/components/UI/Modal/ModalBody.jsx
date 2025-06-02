// This component renders the main content area of a modal.
// It's designed to be scrollable if the content exceeds the modal's height.
import React from "react";

/**
 * ModalBody component.
 *
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The content to be rendered within the modal body.
 * @param {string} [props.className=""] - Optional additional CSS classes for custom styling of the modal body.
 * @returns {JSX.Element} The rendered modal body.
 */
const ModalBody = ({ children, className = "" }) => {
  return (
    // `overflow-y-auto` enables vertical scrolling if content overflows.
    // `flex-grow` allows the body to take up available space between header and footer.
    // `custom-scrollbar` applies custom scrollbar styles defined in global CSS.
    <div
      className={`overflow-y-auto flex-grow custom-scrollbar p-3 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
};

// Memoize the component to optimize performance by preventing unnecessary re-renders.
export default React.memo(ModalBody);
