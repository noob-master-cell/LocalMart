// project/src/components/Filters/CompactFilterBar/FilterOption.jsx
import React from "react";

const FilterOption = ({ label, isActive, onClick, type = "button", value }) => {
  let activeClasses = "";
  let inactiveClasses = "";
  let baseClasses = "text-xs font-medium transition-colors";

  if (type === "status") {
    baseClasses += " py-2 px-3 rounded"; // Status buttons might have different padding
    activeClasses = "bg-indigo-600 text-white shadow-sm";
    inactiveClasses = "text-gray-600 hover:bg-gray-200";
  } else {
    // Default for quick filters (buttons/chips)
    baseClasses += " px-2.5 py-1 rounded-full";
    activeClasses = "bg-indigo-600 text-white";
    inactiveClasses = "bg-gray-100 text-gray-700 hover:bg-gray-200";
  }

  return (
    <button
      onClick={() => onClick(value)} // Pass value to the onClick handler
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      type="button" // Explicitly set type
    >
      {label}
    </button>
  );
};

export default React.memo(FilterOption);
