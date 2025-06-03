import React, { useState, useCallback, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import HomeIcon from "../Icons/HomeIcon";
import ShoppingBagIcon from "../Icons/ShoppingBagIcon";
import TagIcon from "../Icons/TagIcon";
import SearchIcon from "../Icons/SearchIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import LogoutIcon from "../Icons/LogoutIcon"; // Import the new LogoutIcon
import { useDebounce } from "../../hooks/useDebounce";

/**
 * @component Header
 * @description Responsive, accessible header with dropdown-style search panel for desktop and mobile.
 */
const IconButton = ({ icon: Icon, label, onClick, ...props }) => (
  <button
    onClick={onClick}
    className="p-2 text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full transition-colors"
    aria-label={label}
    {...props}
  >
    <Icon className="w-6 h-6" />
  </button>
);

const Header = ({
  user,
  onLogout,
  onNavigateToAuth,
  onSearchChange,
  searchValue = "",
  showSearch = true,
}) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchValue);
  const searchRef = useRef(null);
  const location = useLocation();

  const isAuthRoute = location.pathname.startsWith("/auth");
  const displaySearch = showSearch && !isAuthRoute;

  // Sync external searchValue prop
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Debounce input changes
  const debounced = useDebounce(localSearch, 300);
  useEffect(() => {
    if (onSearchChange) onSearchChange(debounced);
  }, [debounced, onSearchChange]);

  const handleInput = useCallback((e) => {
    setLocalSearch(e.target.value);
  }, []);

  const activateSearch = useCallback(() => {
    setIsSearchActive(true);
    setTimeout(() => searchRef.current?.focus(), 100);
  }, []);

  const collapseSearch = useCallback(() => {
    setIsSearchActive(false);
    // setLocalSearch(""); // User might want to keep search term if they click away
  }, []);

  const clearSearch = useCallback(() => {
    setLocalSearch("");
    onSearchChange(""); // Also notify parent immediately
    searchRef.current?.focus();
  }, [onSearchChange]);

  // Click outside to collapse dropdown when search is empty
  useEffect(() => {
    const onClickOutside = (e) => {
      if (
        isSearchActive &&
        searchRef.current &&
        !searchRef.current.contains(e.target) &&
        !e.target.closest('button[aria-label="Open search"]') && // Don't close if clicking the search icon itself
        !localSearch // Only collapse if search is empty
      ) {
        collapseSearch();
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isSearchActive, localSearch, collapseSearch]);

  // Escape to collapse
  useEffect(() => {
    const onEscape = (e) => {
      if (e.key === "Escape" && isSearchActive) collapseSearch();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [isSearchActive, collapseSearch]);

  // Keyboard shortcut (Slash or Cmd+K)
  useEffect(() => {
    const onKeydown = (e) => {
      if (
        !isSearchActive &&
        displaySearch && // Only activate if search is generally displayed
        ((e.key === "/" &&
          !/^(input|textarea|select)$/i.test(e.target.tagName)) || // Check if not in input
          (e.metaKey && e.key === "k"))
      ) {
        e.preventDefault();
        activateSearch();
      }
    };
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, [activateSearch, isSearchActive, displaySearch]);

  // Helper for NavLink classes
  const navLinkClass = ({ isActive }) =>
    isActive
      ? "flex flex-col items-center p-3 text-indigo-600" // Removed bg-indigo-50 for cleaner look on main nav
      : "flex flex-col items-center p-3 text-gray-600 hover:text-indigo-600";

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <HomeIcon className="text-indigo-600 w-7 h-7 sm:w-8 sm:h-8 transition-colors hover:text-indigo-700" />
              <span className="font-semibold text-xl sm:text-2xl text-indigo-600 hover:text-indigo-700 hidden sm:block">
                LocalMart
              </span>
            </Link>

            {/* Desktop Center: Search + Links */}
            <div className="hidden lg:flex flex-1 items-center justify-center relative">
              {displaySearch && (
                <>
                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 shadow-sm">
                    <SearchIcon className="w-5 h-5 text-gray-500" />
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Search items..."
                      value={localSearch}
                      onChange={handleInput}
                      onFocus={activateSearch} // Activate search on focus for desktop
                      className="ml-2 bg-transparent placeholder-gray-500 focus:outline-none text-sm w-48 focus:w-64 transition-all duration-300"
                      aria-label="Search items"
                    />
                    {localSearch && (
                      <button
                        onClick={clearSearch}
                        aria-label="Clear search"
                        className="p-1 ml-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
                      ></button>
                    )}
                  </div>

                  {/* Desktop Search Dropdown - Refined to show only when search is active AND has input or focus */}
                  {isSearchActive &&
                    (localSearch ||
                      document.activeElement === searchRef.current) && (
                      <div
                        id="search-dropdown-desktop"
                        // role="dialog" // Not really a dialog
                        // aria-modal="true"
                        className="absolute top-full left-1/2 -translate-x-1/2 bg-white z-50 p-3 shadow-lg min-w-[320px] max-w-md mt-2 rounded-md border border-gray-200"
                      >
                        {/* Removed close button and input, using the main input */}
                        {localSearch ? (
                          <div className="text-gray-600 text-sm p-2">
                            Press Enter to search for “
                            <strong>{localSearch}</strong>”
                            {/* Search results preview could go here */}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm p-2 text-center">
                            Start typing to search...
                          </div>
                        )}
                      </div>
                    )}
                </>
              )}

              <div className="flex space-x-4 ml-6">
                <NavLink
                  to="/buy"
                  className={navLinkClass}
                  aria-labelledby="browse-link-desktop"
                >
                  <ShoppingBagIcon className="w-5 h-5 mb-1" />
                  <span id="browse-link-desktop" className="text-xs">
                    Buy
                  </span>
                </NavLink>
                <NavLink
                  to="/sell"
                  className={navLinkClass}
                  aria-labelledby="sell-link-desktop"
                >
                  <TagIcon className="w-5 h-5 mb-1" />
                  <span id="sell-link-desktop" className="text-xs">
                    Sell
                  </span>
                </NavLink>
                <NavLink
                  to="/lostfound"
                  className={navLinkClass}
                  aria-labelledby="lostfound-link-desktop"
                >
                  <SearchIcon className="w-5 h-5 mb-1" />
                  <span id="lostfound-link-desktop" className="text-xs">
                    Lost&Found
                  </span>
                </NavLink>
              </div>
            </div>

            {/* Desktop Right: User Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {user ? (
                <>
                  <UserCircleIcon className="w-6 h-6 text-gray-700" />
                  <span
                    className="text-gray-700 text-sm truncate max-w-[150px]" // Added max-width
                    title={user.displayName || user.email}
                  >
                    {user.displayName || user.email}
                  </span>
                  <button
                    onClick={onLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onNavigateToAuth("login")}
                  className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
                >
                  <UserCircleIcon className="w-5 h-5 mr-1.5" />
                  <span>Login / Sign Up</span>
                </button>
              )}
            </div>

            {/* Compact Mode (Mobile/Tablet): Icons Only */}
            <div className="flex lg:hidden items-center space-x-1 sm:space-x-2">
              {displaySearch && (
                <IconButton
                  icon={SearchIcon}
                  label="Open search"
                  onClick={activateSearch}
                />
              )}
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "p-2 text-indigo-600"
                    : "p-2 text-gray-600 hover:text-indigo-600"
                }
                aria-label="Home"
              >
                <HomeIcon className="w-6 h-6" />
              </NavLink>
              {user ? (
                // If user is logged in, display a Logout button
                <IconButton
                  icon={LogoutIcon} // Using the new LogoutIcon
                  label="Logout"
                  onClick={onLogout}
                  className="p-2 text-gray-600 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full transition-colors" // Custom styling for logout
                />
              ) : (
                // If user is not logged in, display Login/Sign Up icon button
                <IconButton
                  icon={UserCircleIcon}
                  label="Login or Sign Up"
                  onClick={() => onNavigateToAuth("login")}
                />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Dropdown */}
      {displaySearch && isSearchActive && (
        <div
          role="search" // More appropriate role
          // aria-modal="true" // Not a modal, more like a search panel
          className="fixed top-16 left-0 right-0 bg-white z-40 p-3 shadow-lg border-b border-gray-200 lg:hidden"
        >
          <div className="flex items-center">
            <input
              ref={searchRef} // Ensure ref is correctly assigned if needed here, or use the one from desktop
              type="search" // Use type="search" for better semantics
              placeholder="Search items..."
              value={localSearch}
              onChange={handleInput}
              className="flex-1 bg-gray-100 px-4 py-2.5 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
              aria-label="Search items"
            />
            {localSearch && (
              <button
                onClick={clearSearch}
                className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full transition-colors ml-2"
                aria-label="Clear search"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            )}
            <button
              onClick={collapseSearch} // Button to explicitly close/collapse search
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full transition-colors ml-2"
              aria-label="Close search panel"
            >
              <span className="text-lg font-semibold">&times;</span>
            </button>
          </div>
          {/* Search suggestions or quick links could go here */}
          {/* {localSearch && (
            <div className="mt-2 text-gray-600 text-sm p-1">
              Press Enter to search...
            </div>
          )} */}
        </div>
      )}

      {/* Bottom Navigation for compact mode - This part seems to duplicate MobileNavigation.jsx functionality */}
      {/* Considering MobileNavigation.jsx is already in AppLayout, this might be redundant or for a different layout style.
          For now, I will keep it as it was in the provided Header.jsx but note this potential overlap.
      */}
      {!isAuthRoute && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
          <div className="flex justify-around">
            <NavLink to="/buy" className={navLinkClass} aria-label="Browse">
              <ShoppingBagIcon className="w-6 h-6 sm:w-7 sm:h-7 mb-0.5 transform transition-transform duration-150 hover:scale-110" />
              <span className="text-[10px] sm:text-xs">Browse</span>
            </NavLink>
            <NavLink to="/sell" className={navLinkClass} aria-label="Sell">
              <TagIcon className="w-6 h-6 sm:w-7 sm:h-7 mb-0.5 transform transition-transform duration-150 hover:scale-110" />
              <span className="text-[10px] sm:text-xs">Sell</span>
            </NavLink>
            <NavLink
              to="/lostfound"
              className={navLinkClass}
              aria-label="Lost & Found"
            >
              <SearchIcon className="w-6 h-6 sm:w-7 sm:h-7 mb-0.5 transform transition-transform duration-150 hover:scale-110" />
              <span className="text-[10px] sm:text-xs">Lost&Found</span>
            </NavLink>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(Header);