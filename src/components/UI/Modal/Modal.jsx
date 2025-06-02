// project/src/components/UI/Modal/Modal.jsx
import React, { useEffect } from "react";
import ModalHeader from "./ModalHeader";
import ModalBody from "./ModalBody";
import ModalFooter from "./ModalFooter";

const Modal = ({
  isOpen,
  onClose,
  title,
  children, // Represents the body content
  footerContent, // New prop for footer
  size = "md",
  fullHeightMobile = true,
  bodyClassName = "", // Optional class for ModalBody
  footerClassName = "", // Optional class for ModalFooter
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (isOpen && e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    full: "max-w-full mx-2 sm:mx-4",
  };
  const maxWidthClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start sm:items-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose} // Click on backdrop closes modal
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? "modal-title" : undefined} // Use title for aria-labelledby
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${maxWidthClass} ${
          fullHeightMobile
            ? "min-h-screen sm:min-h-0 sm:max-h-[90vh] my-0 sm:my-8"
            : "max-h-[90vh] my-8"
        } flex flex-col`}
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        {title && <ModalHeader title={title} onClose={onClose} />}
        <ModalBody className={bodyClassName}>{children}</ModalBody>
        {footerContent && (
          <ModalFooter className={footerClassName}>{footerContent}</ModalFooter>
        )}
      </div>
    </div>
  );
};

export default React.memo(Modal);
