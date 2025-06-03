import React from "react";
import UserCircleIcon from "../Icons/UserCircleIcon";
import { LinkIcon } from "../Icons"; // Re-using LinkIcon as a placeholder

/**
 * @component Footer
 * @description Renders the footer section of the application.
 * It appears at the end of the page content when scrolled to.
 * Typically hidden on mobile (handled by CSS: `hidden md:block`).
 * Displays user login status, copyright information, and placeholder social links.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} [props.user] - The current user object. If provided, displays user's name or email.
 * @returns {JSX.Element} The footer component.
 */
const Footer = ({ user }) => (
  // Removed: fixed bottom-0 left-0 right-0 z-10 shadow-top
  // Added: mt-auto to help push it to the bottom of the flex container in AppLayout if content is short
  <footer className="bg-slate-50 border-t border-slate-200 hidden md:block mt-auto">
    <div className="container mx-auto py-2 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-y-2">
        {/* Left Side: User Status & App Name */}
        <div className="flex items-center gap-3 text-slate-600 text-sm">
          <UserCircleIcon className="w-5 h-5 text-indigo-600" />
          {user ? (
            <>
              Logged in as{" "}
              <span
                className="font-semibold text-indigo-700"
                title={user.displayName || user.email}
              >
                {user.displayName || user.email}
              </span>
            </>
          ) : (
            "Not logged in"
          )}
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden sm:inline font-semibold text-indigo-700">
            LocalMart
          </span>
        </div>

        {/* Center: Copyright */}
        <div className="text-xs text-slate-500 text-center sm:text-left">
          &copy; {new Date().getFullYear()} LocalMart &mdash; Made with
          <span className="text-red-500 mx-1" aria-label="love">
            &hearts;
          </span>
          for the community.
        </div>

        {/* Right Side: Social Media Links (Placeholders) */}
        <div className="flex items-center space-x-3">
          <a
            href="#" // Replace with your actual social link
            aria-label="Follow us on Twitter"
            className="text-slate-500 hover:text-indigo-600 transition-colors"
          >
            {/* Placeholder for Twitter Icon */}
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M23.5 4.75a9.67 9.67 0 01-2.77.76 4.78 4.78 0 002.12-2.67c-.92.55-1.94.95-3.03 1.16a4.76 4.76 0 00-8.11 4.34A13.53 13.53 0 011.73 3.15a4.76 4.76 0 001.47 6.36 4.73 4.73 0 01-2.15-.6v.06a4.76 4.76 0 003.82 4.67 4.77 4.77 0 01-2.14.08 4.76 4.76 0 004.44 3.3A9.56 9.56 0 010 19.54a13.48 13.48 0 007.3 2.15c8.76 0 13.55-7.26 13.55-13.55l-.01-.62a9.69 9.69 0 002.39-2.53z" />
            </svg>
          </a>
          <a
            href="#" // Replace with your actual social link
            aria-label="Follow us on Facebook"
            className="text-slate-500 hover:text-indigo-600 transition-colors"
          >
            {/* Placeholder for Facebook Icon */}
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                clipRule="evenodd"
              />
            </svg>
          </a>
          <a
            href="#" // Replace with your actual social link
            aria-label="Check our GitHub"
            className="text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <LinkIcon className="w-5 h-5" />{" "}
            {/* Using LinkIcon as a placeholder */}
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default React.memo(Footer);