import React, { useState, useCallback, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import HomeIcon from "../Icons/HomeIcon";
import ShoppingBagIcon from "../Icons/ShoppingBagIcon";
import TagIcon from "../Icons/TagIcon";
import SearchIcon from "../Icons/SearchIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import LogoutIcon from "../Icons/LogoutIcon";
import { useDebounce } from "../../hooks/useDebounce";

/**
 * @component Header
 * @description Responsive, accessible header with dropdown‐style search panel for desktop and mobile.
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
        !e.target.closest('button[aria-label="Open search"]') &&
        !localSearch
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
        displaySearch &&
        ((e.key === "/" &&
          !/^(input|textarea|select)$/i.test(e.target.tagName)) ||
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
      ? "flex flex-col items-center p-3 text-indigo-600"
      : "flex flex-col items-center p-3 text-gray-600 hover:text-indigo-600";

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50 w-full">
        <div className="w-full px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between h-16 items-center gap-2 sm:gap-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 min-w-0"
            >
              <HomeIcon className="text-indigo-600 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 transition-colors hover:text-indigo-700" />
              <span className="font-semibold text-lg sm:text-xl lg:text-2xl text-indigo-600 hover:text-indigo-700 hidden sm:block truncate">
                LocalMart
              </span>
            </Link>

            {/* Desktop Center: Search + Links */}
            <div className="hidden lg:flex items-center space-x-6 flex-shrink-0">
              {displaySearch && (
                <>
                  <div className="relative">
                    <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 shadow-sm">
                      <SearchIcon className="w-5 h-5 text-gray-500" />
                      <input
                        ref={searchRef}
                        type="text"
                        placeholder="Search items..."
                        value={localSearch}
                        onChange={handleInput}
                        onFocus={activateSearch} // Activate search on focus for desktop
                        className="ml-2 bg-transparent placeholder-gray-500 focus:outline-none text-sm w-40 focus:w-56 transition-all duration-300"
                        aria-label="Search items"
                      />
                      {localSearch && (
                        <button
                          onClick={clearSearch}
                          aria-label="Clear search"
                          className="p-1 ml-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Desktop Search Dropdown */}
                    {isSearchActive &&
                      (localSearch ||
                        document.activeElement === searchRef.current) && (
                        <div
                          id="search-dropdown-desktop"
                          className="absolute top-full left-1/2 -translate-x-1/2 bg-white z-50 p-3 shadow-lg min-w-[300px] max-w-md mt-2 rounded-md border border-gray-200"
                        >
                          {localSearch ? (
                            <div className="text-gray-600 text-sm p-2">
                              Press Enter to search for "
                              <strong>{localSearch}</strong>"
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm p-2 text-center">
                              Start typing to search...
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </>
              )}

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

            {/* Desktop Right: User Actions */}
            <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
              {user ? (
                <>
                  <UserCircleIcon className="w-6 h-6 text-gray-700" />
                  <span
                    className="text-gray-700 text-sm truncate max-w-[150px]"
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

            {/* Compact Mode (Mobile/Tablet): Search + Icons */}
            <div className="flex lg:hidden items-center gap-1 sm:gap-2 flex-1 min-w-0">
              {displaySearch && (
                <div className="flex items-center bg-gray-100 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm flex-1 min-w-0">
                  <SearchIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <input
                    ref={searchRef}
                    type="search"
                    placeholder="Search..."
                    value={localSearch}
                    onChange={handleInput}
                    className="ml-1 sm:ml-2 bg-transparent placeholder-gray-500 focus:outline-none text-sm flex-1 min-w-0"
                    aria-label="Search items"
                  />
                </div>
              )}
              <div className="flex items-center gap-0 sm:gap-1">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? "p-1.5 sm:p-2 text-indigo-600 flex-shrink-0"
                      : "p-1.5 sm:p-2 text-gray-600 hover:text-indigo-600 flex-shrink-0"
                  }
                  aria-label="Home"
                >
                  <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </NavLink>
                {user ? (
                  <button
                    onClick={onLogout}
                    className="p-1.5 sm:p-2 text-gray-600 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full transition-colors flex-shrink-0"
                    aria-label="Logout"
                  >
                    <LogoutIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigateToAuth("login")}
                    className="p-1.5 sm:p-2 text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full transition-colors flex-shrink-0"
                    aria-label="Login or Sign Up"
                  >
                    <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Dropdown */}
      {displaySearch && isSearchActive && (
        <div
          role="search"
          className="fixed top-16 left-0 right-0 bg-white z-40 p-3 shadow-lg border-b border-gray-200 lg:hidden"
        >
          <div className="flex items-center">
            <input
              ref={searchRef}
              type="search"
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
                  />
                </svg>
              </button>
            )}
            <button
              onClick={collapseSearch}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full transition-colors ml-2"
              aria-label="Close search panel"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation for compact mode */}
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
