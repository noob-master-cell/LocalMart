import React from "react";

/**
 * @component Modal
 * @description A reusable modal component that displays content in a centered dialog.
 * It includes a backdrop, and the modal closes when the backdrop is clicked.
 * Content clicking does not close the modal.
 *
 * @param {object} props - The properties passed to the component.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {Function} props.onClose - Callback function invoked when the modal is requested to close (e.g., backdrop click or close button).
 * @param {string} [props.title="Modal Title"] - The title displayed in the modal header.
 * @param {React.ReactNode} props.children - The content to be rendered within the modal body.
 * @returns {JSX.Element|null} The Modal component if `isOpen` is true, otherwise null.
 */
const Modal = ({ isOpen, onClose, title = "Modal Title", children }) => {
  if (!isOpen) return null; // Do not render if not open

  /**
   * Handles the click event on the modal backdrop.
   * Calls the onClose prop to close the modal.
   * @param {React.MouseEvent<HTMLDivElement>} e - The mouse event.
   */
  const handleBackdropClick = (e) => {
    onClose();
  };

  /**
   * Prevents the modal from closing when its content is clicked.
   * @param {React.MouseEvent<HTMLDivElement>} e - The mouse event.
   */
  const handleContentClick = (e) => {
    e.stopPropagation(); // Prevents the click from bubbling up to the backdrop
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={handleBackdropClick} // Close modal on backdrop click
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-main"
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={handleContentClick} // Prevent modal close on content click
      >
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white py-2 z-10 border-b">
          <h3 id="modal-title-main" className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose} // Close button
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        {children} {/* Modal body content */}
      </div>
    </div>
  );
};

export default Modal;