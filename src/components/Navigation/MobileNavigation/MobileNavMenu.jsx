// project/src/components/Navigation/MobileNavigation/MobileNavMenu.jsx
import React from "react";
import NavLinkRouter from "../NavLinkRouter"; // Adjusted path
import ShoppingBagIcon from "../../Icons/ShoppingBagIcon"; // Adjusted path
import TagIcon from "../../Icons/TagIcon"; // Adjusted path
import SearchIcon from "../../Icons/SearchIcon"; // Adjusted path
import UserCircleIcon from "../../Icons/UserCircleIcon"; // Adjusted path

const MobileNavMenu = ({ user, onLogout }) => {
  return (
    <div className="flex justify-around items-center h-16">
      <NavLinkRouter to="/buy" label="Buy" icon={<ShoppingBagIcon />} />
      <NavLinkRouter to="/sell" label="Sell" icon={<TagIcon />} />
      <NavLinkRouter
        to="/lostfound"
        label="Lost & Found"
        icon={<SearchIcon />}
      />
      {user ? (
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center px-2 py-1 rounded-md text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 w-full"
        >
          <UserCircleIcon />
          <span className="mt-0.5 text-xs">Logout</span>
        </button>
      ) : (
        <NavLinkRouter
          to="/auth/login" // Assuming NavLinkRouter handles navigation to auth pages
          label="Account"
          icon={<UserCircleIcon />}
          isAuthTrigger
        />
      )}
    </div>
  );
};

export default MobileNavMenu;
