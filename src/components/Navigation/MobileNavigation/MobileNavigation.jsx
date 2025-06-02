import React from "react";
import MobileNavMenu from "./MobileNavMenu";

/**
 * @component MobileNavigation
 * @description A container for the mobile navigation menu, typically fixed at the bottom of the screen on mobile devices.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} [props.user] - The current user object, passed to MobileNavMenu.
 * @param {Function} [props.onLogout] - Callback function for logging out, passed to MobileNavMenu.
 * @returns {JSX.Element} The mobile navigation bar.
 */
const MobileNavigation = ({ user, onLogout }) => {
  // This component wraps MobileNavMenu and provides its fixed positioning
  // for mobile views.
  return (
    <div className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-30 shadow-top">
      <MobileNavMenu user={user} onLogout={onLogout} />
    </div>
  );
};
export default MobileNavigation;
