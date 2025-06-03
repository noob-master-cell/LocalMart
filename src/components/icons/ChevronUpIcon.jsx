// src/components/Icons/ChevronUpIcon.jsx
import React from "react";

const ChevronUpIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 10.5l7.5-7.5 7.5 7.5"
    />{" "}
    {/* Adjusted path for upward chevron */}
  </svg>
);

export default ChevronUpIcon;
