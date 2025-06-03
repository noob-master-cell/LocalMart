import React, { useState, useCallback, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import HomeIcon from "../Icons/HomeIcon";
import ShoppingBagIcon from "../Icons/ShoppingBagIcon";
import TagIcon from "../Icons/TagIcon";
import SearchIcon from "../Icons/SearchIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
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
    setLocalSearch("");
  }, []);

  const clearSearch = useCallback(() => {
    setLocalSearch("");
    searchRef.current?.focus();
  }, []);

  // Click outside to collapse dropdown when search is empty
  useEffect(() => {
    const onClickOutside = (e) => {
      if (
        isSearchActive &&
        searchRef.current &&
        !searchRef.current.contains(e.target) &&
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
        ((e.key === "/" && !e.target.matches("input, textarea")) ||
          (e.metaKey && e.key === "k"))
      ) {
        e.preventDefault();
        activateSearch();
      }
    };
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, [activateSearch, isSearchActive]);

  // Helper for NavLink classes
  const navLinkClass = ({ isActive }) =>
    isActive
      ? "flex flex-col items-center p-3 text-indigo-600"
      : "flex flex-col items-center p-3 text-gray-600 hover:text-indigo-600";

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <HomeIcon className="text-indigo-600 w-6 h-6 transition-colors hover:text-indigo-700" />
              <span className="font-semibold text-xl text-indigo-600 hover:text-indigo-700">
                LocalMart
              </span>
            </Link>

            {/* Desktop Center: Search + Links */}
            <div className="hidden lg:flex flex-1 items-center justify-center relative">
              {displaySearch && (
                <>
                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 shadow">
                    <SearchIcon className="w-5 h-5 text-gray-500" />
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Search items..."
                      value={localSearch}
                      onChange={handleInput}
                      className="ml-2 bg-transparent placeholder-gray-500 focus:outline-none text-sm w-48 focus:w-64 transition-all duration-300"
                      aria-label="Search items"
                    />
                    {localSearch && (
                      <button
                        onClick={clearSearch}
                        aria-label="Clear search"
                        className="p-1 ml-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
                      >
                        <span className="text-gray-500 text-lg">&times;</span>
                      </button>
                    )}
                    <button
                      onClick={activateSearch}
                      aria-label="Toggle search dropdown"
                      aria-expanded={isSearchActive}
                      className="p-1 ml-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
                    >
                      <span className="sr-only">Toggle search dropdown</span>
                    </button>
                  </div>

                  {/* Desktop Search Dropdown */}
                  {isSearchActive && (
                    <div
                      id="search-dropdown-desktop"
                      role="dialog"
                      aria-modal="true"
                      className="absolute top-full left-0 right-0 bg-white z-50 p-2 shadow-lg max-w-md mx-auto mt-1 rounded-md"
                    >
                      <div className="flex items-center border-b border-gray-200 pb-2">
                        <button
                          onClick={collapseSearch}
                          className="p-2 text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full transition-colors"
                          aria-label="Close search"
                        >
                          <span className="text-lg">&times;</span>
                        </button>
                        <input
                          ref={searchRef}
                          type="text"
                          placeholder="Search items..."
                          value={localSearch}
                          onChange={handleInput}
                          className="flex-1 ml-2 bg-transparent placeholder-gray-500 focus:outline-none text-base"
                          aria-label="Search items"
                        />
                        {localSearch && (
                          <button
                            onClick={clearSearch}
                            className="p-2 text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full transition-colors"
                            aria-label="Clear search"
                          >
                            <span className="text-lg">&times;</span>
                          </button>
                        )}
                      </div>
                      {localSearch && (
                        <div className="mt-2 text-gray-600 text-sm">
                          <p>Press Enter to search for “{localSearch}”</p>
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
                  <span id="browse-link-desktop" className="text-sm">
                    Buy
                  </span>
                </NavLink>
                <NavLink
                  to="/sell"
                  className={navLinkClass}
                  aria-labelledby="sell-link-desktop"
                >
                  <TagIcon className="w-5 h-5 mb-1" />
                  <span id="sell-link-desktop" className="text-sm">
                    Sell
                  </span>
                </NavLink>
                <NavLink
                  to="/lostfound"
                  className={navLinkClass}
                  aria-labelledby="lostfound-link-desktop"
                >
                  <SearchIcon className="w-5 h-5 mb-1" />
                  <span id="lostfound-link-desktop" className="text-sm">
                    Lost & Found
                  </span>
                </NavLink>
              </div>
            </div>

            {/* Desktop Right: User Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <>
                  <UserCircleIcon className="w-6 h-6 text-gray-700" />
                  <span
                    className="text-gray-700 text-sm truncate max-w-xs"
                    title={user.displayName || user.email}
                  >
                    {user.displayName || user.email}
                  </span>
                  <button
                    onClick={onLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onNavigateToAuth("login")}
                  className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <UserCircleIcon className="w-5 h-5 mr-1" />
                  <span>Login / Sign Up</span>
                </button>
              )}
            </div>

            {/* Compact Mode: Icons Only */}
            <div className="flex lg:hidden items-center space-x-2">
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
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    isActive
                      ? "p-2 text-indigo-600"
                      : "p-2 text-gray-600 hover:text-indigo-600"
                  }
                  aria-label="Profile"
                >
                  <UserCircleIcon className="w-6 h-6" />
                </NavLink>
              ) : (
                <IconButton
                  icon={UserCircleIcon}
                  label="Login / Sign Up"
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
          role="dialog"
          aria-modal="true"
          className="fixed top-16 left-0 right-0 bg-white z-50 p-2 shadow-lg lg:hidden"
        >
          <div className="flex items-center border-b border-gray-200 pb-2">
            <button
              onClick={collapseSearch}
              className="p-2 text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full transition-colors"
              aria-label="Close search"
            >
              <span className="text-lg">×</span>
            </button>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search items..."
              value={localSearch}
              onChange={handleInput}
              className="flex-1 ml-2 bg-transparent placeholder-gray-500 focus:outline-none text-base"
              aria-label="Search items"
            />
            {localSearch && (
              <button
                onClick={clearSearch}
                className="p-2 text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <span className="text-lg">×</span>
              </button>
            )}
          </div>
          {localSearch && (
            <div className="mt-2 text-gray-600 text-sm">
              <p>Press Enter to search for “{localSearch}”</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation for compact mode */}
      {!isAuthRoute && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
          <div className="flex justify-around">
            <NavLink to="/buy" className={navLinkClass} aria-label="Browse">
              <ShoppingBagIcon className="w-7 h-7 mb-1 transform transition-transform duration-150 hover:scale-110" />
              <span className="text-xs">Browse</span>
            </NavLink>
            <NavLink to="/sell" className={navLinkClass} aria-label="Sell">
              <TagIcon className="w-7 h-7 mb-1 transform transition-transform duration-150 hover:scale-110" />
              <span className="text-xs">Sell</span>
            </NavLink>
            <NavLink to="/lostfound" className={navLinkClass} aria-label="Lost">
              <SearchIcon className="w-7 h-7 mb-1 transform transition-transform duration-150 hover:scale-110" />
              <span className="text-xs">Lost</span>
            </NavLink>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(Header);
