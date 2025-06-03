import NavLinkRouter from "../NavLinkRouter";
import {
  ShoppingBagIcon,
  TagIcon,
  SearchIcon,
  UserCircleIcon,
} from "../../icons";
/**
 * @component MobileNavMenu
 * @description Renders the actual navigation links for the mobile navigation bar.
 * It displays different options based on whether a user is logged in.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} [props.user] - The current user object. If present, shows user-specific options like a profile link.
 * @param {Function} [props.onLogout] - Callback function to handle user logout (no longer used here, moved to Header).
 * @returns {JSX.Element} A set of navigation links for mobile view.
 */
const MobileNavMenu = ({ user }) => {
  // Removed onLogout from props as it's not used here anymore
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
        // If user is logged in, display a link to their profile page
        // Ensure you have a /profile route or change this to a relevant page like /sell
        <NavLinkRouter
          to="/profile" // You might need to create this route or link to /sell or other user page
          label="Profile"
          icon={<UserCircleIcon />}
        />
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
