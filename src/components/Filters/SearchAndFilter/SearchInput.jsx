// project/src/components/Filters/SearchAndFilter/SearchInput.jsx
import React from "react";
import SearchIcon from "../../Icons/SearchIcon"; // Adjusted path

const SearchInput = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search items...",
}) => {
  return (
    <div className="relative mb-4">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={onSearchChange} // Expects the event object e
        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
  );
};

export default React.memo(SearchInput);
