import React from "react";
import UserCircleIcon from "../Icons/UserCircleIcon";

/**
 * @component Footer
 * @description Renders the footer section of the application.
 * It is fixed at the bottom on desktop screens and typically hidden on mobile (handled by CSS: `hidden md:block`).
 * Displays user login status and copyright information.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} [props.user] - The current user object. If provided, displays user's name or email.
 * @returns {JSX.Element} The footer component.
 */
const Footer = ({ user }) => (
  <footer className="bg-white shadow-inner border-t border-gray-100 fixed bottom-0 left-0 right-0 z-10 hidden md:block">
    <div className="container mx-auto py-3 flex items-center justify-between px-4">
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <UserCircleIcon className="w-5 h-5" />
        {user ? (
          <>
            Logged in as{" "}
            <span className="font-medium" title={user.displayName || user.email}>
              {user.displayName || user.email}
            </span>
          </>
        ) : (
          "Not logged in"
        )}
      </div>
      <div className="text-xs text-gray-400">
        &copy; {new Date().getFullYear()} LocalMarketplace &mdash; Made with
        <span className="text-red-400 mx-1" aria-label="love">&hearts;</span>
        for the community.
      </div>
    </div>
  </footer>
);

export default React.memo(Footer);