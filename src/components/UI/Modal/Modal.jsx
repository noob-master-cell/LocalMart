// This is a general-purpose Modal component.
// It provides a consistent structure for displaying modal dialogs,
// including a header, body (children), and an optional footer.
// It handles accessibility features like ARIA attributes and keyboard (Escape key) closing.
import React, { useEffect } from "react";
import ModalHeader from "./ModalHeader"; // Sub-component for the modal's header.
import ModalBody from "./ModalBody"; // Sub-component for the modal's main content area.
import ModalFooter from "./ModalFooter"; // Sub-component for the modal's footer.

/**
 * Modal component.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls whether the modal is visible.
 * @param {Function} props.onClose - Callback function to close the modal.
 * @param {string} [props.title] - Optional title for the modal header.
 * @param {React.ReactNode} props.children - Content to be rendered in the modal body.
 * @param {React.ReactNode} [props.footerContent] - Optional content for the modal footer (e.g., action buttons).
 * @param {string} [props.size="md"] - Size of the modal ('sm', 'md', 'lg', 'xl', 'full').
 * @param {boolean} [props.fullHeightMobile=true] - If true, modal takes full screen height on mobile.
 * @param {string} [props.bodyClassName=""] - Additional CSS classes for the ModalBody.
 * @param {string} [props.footerClassName=""] - Additional CSS classes for the ModalFooter.
 * @returns {JSX.Element|null} The Modal component or null if not open.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footerContent,
  size = "md", // Default modal size.
  fullHeightMobile = true, // Modal behavior on mobile devices.
  bodyClassName = "",
  footerClassName = "",
}) => {
  // Effect to manage body overflow when the modal is open/closed
  // to prevent background scrolling.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = ""; // Reset to default.
    }
    // Cleanup function to reset body overflow when the component unmounts.
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Effect to handle closing the modal when the Escape key is pressed.
  useEffect(() => {
    const handleEscape = (e) => {
      if (isOpen && e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    // Cleanup function to remove the event listener.
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // If the modal is not open, render nothing.
  if (!isOpen) return null;

  // Define CSS classes for different modal sizes.
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    full: "max-w-full mx-2 sm:mx-4", // Full width with small margins.
  };
  const maxWidthClass = sizeClasses[size] || sizeClasses.md; // Fallback to 'md' if size is invalid.

  return (
    // Modal backdrop: fixed position, covers the screen, darkens the background.
    // Clicking the backdrop calls `onClose`.
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start sm:items-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
      aria-modal="true" // Accessibility: indicates this is a modal dialog.
      role="dialog" // Accessibility: defines the role of the element.
      aria-labelledby={title ? "modal-title" : undefined} // Associates the modal with its title for screen readers.
    >
      {/* Modal content container: prevents clicks inside from closing the modal (stopPropagation). */}
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${maxWidthClass} ${
          fullHeightMobile
            ? "min-h-screen sm:min-h-0 sm:max-h-[90vh] my-0 sm:my-8" // Full height on mobile, constrained on larger screens.
            : "max-h-[90vh] my-8" // Constrained height on all screens.
        } flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Render ModalHeader if a title is provided. */}
        {title && <ModalHeader title={title} onClose={onClose} />}
        {/* Render ModalBody with the children prop as its content. */}
        <ModalBody className={bodyClassName}>{children}</ModalBody>
        {/* Render ModalFooter if footerContent is provided. */}
        {footerContent && (
          <ModalFooter className={footerClassName}>{footerContent}</ModalFooter>
        )}
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders if props haven't changed.
export default React.memo(Modal);
