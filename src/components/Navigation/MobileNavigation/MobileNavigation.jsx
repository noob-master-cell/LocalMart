// project/src/components/Navigation/MobileNavigation/MobileNavigation.jsx
import React from "react";
import MobileNavMenu from "./MobileNavMenu";

const MobileNavigation = ({ user, onLogout }) => {
  // The onNavigateToAuth prop was implicitly handled by NavLinkRouter's "to" prop
  // in the original component when user is not logged in.
  // If onNavigateToAuth was for a different purpose, it might need to be passed to MobileNavMenu
  // or handled here if there were other direct auth navigation triggers.
  return (
    <div className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-30 shadow-top">
      <MobileNavMenu user={user} onLogout={onLogout} />
    </div>
  );
};
export default MobileNavigation;
