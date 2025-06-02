// This component renders the header section of a modal.
// It typically includes the modal title and a close button.
import React from "react";

/**
 * ModalHeader component.
 *
 * @param {object} props - The component's props.
 * @param {string} props.title - The title to display in the modal header.
 * @param {Function} props.onClose - Callback function to be invoked when the close button is clicked.
 * @returns {JSX.Element} The rendered modal header.
 */
const ModalHeader = ({ title, onClose }) => {
  return (
    // Sticky header that stays at the top of the modal content when scrolling.
    <div className="sticky top-0 flex justify-between items-center p-3 sm:p-4 border-b bg-white z-10 rounded-t-lg">
      {/* Modal title. Truncates if too long and shows full title on hover. */}
      <h3
        id="modal-title" // Accessibility: associates the title with the modal dialog.
        // Consider making this ID dynamic if multiple modals with titles can be open simultaneously
        // to ensure unique IDs, e.g., `modal-title-${uniqueId}`.
        className="text-xl font-semibold text-gray-800 pr-8 truncate" // `pr-8` to prevent overlap with close button.
        title={title} // Tooltip for full title text on hover.
      >
        {title}
      </h3>
      {/* Close button. Positioned absolutely to the top-right of the header. */}
      <button
        onClick={onClose}
        className="absolute right-3 sm:right-4 top-3 sm:top-4 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
        aria-label="Close modal" // Accessibility: provides a label for screen readers.
      >
        {/* SVG for the close (X) icon. */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders if its props haven't changed.
export default React.memo(ModalHeader);
