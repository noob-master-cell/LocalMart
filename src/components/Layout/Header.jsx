import React, { useState, useCallback, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import NavLinkRouter from "../Navigation/NavLinkRouter";
import HomeIcon from "../Icons/HomeIcon";
import ShoppingBagIcon from "../Icons/ShoppingBagIcon";
import TagIcon from "../Icons/TagIcon";
import SearchIcon from "../Icons/SearchIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import { useDebounce } from "../../hooks/useDebounce";

/**
 * @component Header
 * @description The main application header, including navigation, search functionality, and user authentication status.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} [props.user] - The current user object.
 * @param {Function} [props.onLogout] - Callback function to handle user logout.
 * @param {Function} [props.onNavigateToAuth] - Callback function to navigate to authentication pages.
 * @param {Function} [props.onSearchChange] - Callback function triggered when the debounced search value changes.
 * @param {string} [props.searchValue=""] - The initial value for the search input.
 * @param {boolean} [props.showSearch=true] - Whether to display the search input.
 * @returns {JSX.Element} The application header.
 */
const Header = ({
  user,
  onLogout,
  onNavigateToAuth,
  onSearchChange,
  searchValue = "",
  showSearch = true,
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const searchInputRef = useRef(null);
  const location = useLocation();

  // Determine if the current page is an authentication page or if search should be shown
  const isAuthPage = location.pathname.startsWith("/auth");
  const shouldShowSearch = showSearch && !isAuthPage;

  // Synchronize localSearchValue with searchValue prop
  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  // Debounce the local search value to limit API calls or frequent updates
  const debouncedSearchValue = useDebounce(localSearchValue, 300);

  // Effect to call onSearchChange when debounced search value changes
  useEffect(() => {
    onSearchChange?.(debouncedSearchValue);
  }, [debouncedSearchValue, onSearchChange]);

  /**
   * Handles input changes in the search field.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleSearchInput = useCallback((e) => {
    setLocalSearchValue(e.target.value);
  }, []);

  /**
   * Expands the search input field and focuses it.
   */
  const handleSearchExpand = useCallback(() => {
    setIsSearchExpanded(true);
    setTimeout(() => { // Delay focus to allow for CSS transitions
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  /**
   * Collapses the search input field and clears its value.
   */
  const handleSearchCollapse = useCallback(() => {
    setIsSearchExpanded(false);
    setLocalSearchValue(""); // Clear search on collapse
  }, []);

  /**
   * Clears the search input field and focuses it.
   */
  const handleSearchClear = useCallback(() => {
    setLocalSearchValue("");
    searchInputRef.current?.focus();
  }, []);

  // Effect to handle clicks outside the search input to collapse it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSearchExpanded &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) && // Click is outside the input
        !localSearchValue // And the input is empty
      ) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside); // Cleanup
  }, [isSearchExpanded, localSearchValue]);

  // Effect to handle the "Escape" key to collapse the search input
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isSearchExpanded) {
        handleSearchCollapse();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape); // Cleanup
  }, [isSearchExpanded, handleSearchCollapse]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo and application name, links to home */}
          <Link
            to="/"
            className={`flex items-center cursor-pointer group p-2 -ml-2 transition-all duration-300 ${
              isSearchExpanded ? "sm:flex hidden" : "flex" // Responsive visibility when search is expanded
            }`}
          >
            <HomeIcon className="text-indigo-600 group-hover:text-indigo-700 transition-colors h-6 w-6 sm:h-6 sm:w-6" />
            <span
              className={`font-bold text-indigo-600 group-hover:text-indigo-700 ml-1.5 sm:ml-2 transition-all duration-300 ${
                isSearchExpanded
                  ? "text-base sm:text-xl" // Adjust text size based on search expansion
                  : "text-base sm:text-xl"
              }`}
            >
              LocalMart
            </span>
          </Link>

          {/* Search input and main navigation links container */}
          <div className="flex items-center flex-1 max-w-2xl mx-4">
            {shouldShowSearch && (
              <div
                className={`relative transition-all duration-300 ease-in-out ${
                  isSearchExpanded // Dynamically adjust width and positioning for search expansion
                    ? "flex-1 absolute inset-0 sm:relative sm:flex-1 bg-white sm:bg-transparent z-50 p-3 sm:p-0"
                    : "w-8 sm:w-64 flex-shrink-0"
                }`}
              >
                <div
                  className={`relative flex items-center ${
                    isSearchExpanded ? "w-full" : "w-full"
                  }`}
                >
                  <div className="absolute left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search items..."
                    value={localSearchValue}
                    onChange={handleSearchInput}
                    onFocus={handleSearchExpand} // Expand search on focus
                    className={`block w-full pl-10 pr-8 py-1.5 sm:py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                      isSearchExpanded || localSearchValue
                        ? "opacity-100" // Full opacity when expanded or has value
                        : "opacity-100 sm:opacity-100 cursor-pointer" // Default state
                    }`}
                    style={{
                      transform: isSearchExpanded ? "scale(1)" : "scale(1)", // Ensures consistent scaling
                    }}
                    aria-label="Search items"
                  />
                  {/* Clear search button, visible when there's text */}
                  {localSearchValue && (
                    <button
                      onClick={handleSearchClear}
                      className="absolute right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                      type="button"
                      aria-label="Clear search"
                    >
                      <span className="text-xl leading-none">&times;</span>
                    </button>
                  )}
                  {/* Close button for expanded search on mobile */}
                  {isSearchExpanded && (
                    <button
                      onClick={handleSearchCollapse}
                      className="absolute top-1/2 -right-10 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 sm:hidden whitespace-nowrap"
                      type="button"
                      aria-label="Close search"
                    >
                      Close
                    </button>
                  )}
                </div>
                {/* Search suggestions or quick results (placeholder example) */}
                {isSearchExpanded && localSearchValue && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    <div className="p-3 text-sm text-gray-500">
                      Press Enter to search for "{localSearchValue}"
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Desktop navigation links */}
            <div
              className={`hidden md:flex items-center space-x-0.5 transition-all duration-300 ${
                shouldShowSearch ? "ml-4" : "" // Add margin if search is shown
              } ${isSearchExpanded ? "lg:flex hidden" : "md:flex"}`} // Responsive visibility
            >
              <NavLinkRouter to="/buy" label="Buy" icon={<ShoppingBagIcon />} />
              <NavLinkRouter to="/sell" label="Sell" icon={<TagIcon />} />
              <NavLinkRouter
                to="/lostfound"
                label="Lost & Found"
                icon={<SearchIcon />} // Using SearchIcon for Lost & Found section
              />
            </div>
          </div>

          {/* User authentication section (Login/Logout, User Info) */}
          <div
            className={`flex items-center transition-all duration-300 ${
              isSearchExpanded ? "ml-2 hidden sm:flex" : "" // Adjust margin and visibility when search is expanded
            }`}
          >
            {user ? (
              // Display user info and logout button if logged in
              <div className="flex items-center space-x-1.5 sm:space-x-3">
                <span
                  className={`text-gray-700 text-xs sm:text-sm max-w-[70px] sm:max-w-[150px] truncate transition-all duration-300 ${
                    isSearchExpanded ? "hidden sm:inline" : "hidden sm:inline" // Responsive visibility
                  }`}
                  title={user.displayName || user.email || "User"}
                >
                  {user.displayName || user.email || "User"}
                </span>
                <button
                  onClick={onLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <span className={isSearchExpanded ? "hidden sm:inline" : ""}> {/* Text for larger screens */}
                    Logout
                  </span>
                  <span className={isSearchExpanded ? "sm:hidden" : "hidden"}> {/* Icon for smaller screens when search is expanded */}
                    <UserCircleIcon className="w-4 h-4" />
                  </span>
                </button>
              </div>
            ) : (
              // Display Login/Sign Up button if not logged in
              <button
                onClick={() => onNavigateToAuth("login")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center whitespace-nowrap"
              >
                <UserCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-1.5" />
                <span className={isSearchExpanded ? "hidden sm:inline" : ""}> {/* Text for larger screens */}
                  Login/Sign Up
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation bar (secondary links), shown when not on auth pages and search is not expanded */}
      {!isAuthPage && !isSearchExpanded && (
        <div className="md:hidden border-t border-gray-100 bg-gray-50 px-4 py-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex space-x-4">
              <Link
                to="/buy"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Browse Items
              </Link>
              <Link
                to="/sell"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Sell Item
              </Link>
              <Link
                to="/lostfound"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Lost & Found
              </Link>
            </div>
            {/* Mobile search button - expands search bar on click */}
            {shouldShowSearch && !localSearchValue && (
              <button
                onClick={handleSearchExpand}
                className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
                aria-label="Open search"
              >
                <SearchIcon className="w-4 h-4 mr-1" />
                Search
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default React.memo(Header);