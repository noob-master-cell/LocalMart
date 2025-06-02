// project/src/components/UI/Modal/ModalBody.jsx
import React from "react";

const ModalBody = ({ children, className = "" }) => {
  return (
    <div
      className={`overflow-y-auto flex-grow custom-scrollbar p-3 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default React.memo(ModalBody);
