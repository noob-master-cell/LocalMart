import React from "react";
import NavLinkRouter from "../NavLinkRouter";
import ShoppingBagIcon from "../../Icons/ShoppingBagIcon";
import TagIcon from "../../Icons/TagIcon";
import SearchIcon from "../../Icons/SearchIcon";
import UserCircleIcon from "../../Icons/UserCircleIcon";

/**
 * @component MobileNavMenu
 * @description Renders the actual navigation links for the mobile navigation bar.
 * It displays different options based on whether a user is logged in.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} [props.user] - The current user object. If present, shows user-specific options like logout.
 * @param {Function} [props.onLogout] - Callback function to handle user logout.
 * @returns {JSX.Element} A set of navigation links for mobile view.
 */
const MobileNavMenu = ({ user, onLogout }) => {
  return (
    <div className="flex justify-around items-center h-16">
      {/* Navigation link for the 'Buy' section */}
      <NavLinkRouter to="/buy" label="Buy" icon={<ShoppingBagIcon />} />
      {/* Navigation link for the 'Sell' section */}
      <NavLinkRouter to="/sell" label="Sell" icon={<TagIcon />} />
      {/* Navigation link for the 'Lost & Found' section */}
      <NavLinkRouter
        to="/lostfound"
        label="Lost & Found"
        icon={<SearchIcon />}
      />
      {/* Conditional rendering for user authentication status */}
      {user ? (
        // If user is logged in, display a Logout button
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center px-2 py-1 rounded-md text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 w-full"
          aria-label="Logout"
        >
          <UserCircleIcon />
          <span className="mt-0.5 text-xs">Logout</span>
        </button>
      ) : (
        // If user is not logged in, display a link to the Account/Login page
        <NavLinkRouter
          to="/auth/login"
          label="Account"
          icon={<UserCircleIcon />}
          isAuthTrigger // Indicates this link relates to authentication routes
        />
      )}
    </div>
  );
};

export default MobileNavMenu;
