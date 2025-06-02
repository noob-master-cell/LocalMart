// project/src/components/UI/Modal/ModalHeader.jsx
import React from "react";

const ModalHeader = ({ title, onClose }) => {
  return (
    <div className="sticky top-0 flex justify-between items-center p-3 sm:p-4 border-b bg-white z-10 rounded-t-lg">
      <h3
        id="modal-title" // Consider making id dynamic if multiple modals can be open with unique titles
        className="text-xl font-semibold text-gray-800 pr-8 truncate" // Added truncate
        title={title} // Added title attribute for full text on hover
      >
        {title}
      </h3>
      <button
        onClick={onClose}
        className="absolute right-3 sm:right-4 top-3 sm:top-4 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
        aria-label="Close modal"
      >
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

export default React.memo(ModalHeader);
