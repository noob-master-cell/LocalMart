// project/src/components/UI/Modal/ModalFooter.jsx
import React from "react";

const ModalFooter = ({ children, className = "" }) => {
  if (!children) return null;

  return (
    <div
      className={`sticky bottom-0 p-3 sm:p-4 border-t bg-white rounded-b-lg flex justify-end space-x-3 ${className}`}
    >
      {children}
    </div>
  );
};

export default React.memo(ModalFooter);
