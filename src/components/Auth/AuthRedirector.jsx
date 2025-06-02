import React from "react";
import UserCircleIcon from "../Icons/UserCircleIcon"; // Icon for visual representation

/**
 * @component AuthRedirector
 * @description A component displayed to prompt unauthenticated users to log in or sign up.
 * It typically shows a message and a button to navigate to authentication pages.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} props.message - The message to display to the user (e.g., "Please log in to continue").
 * @param {Function} props.onNavigateToAuth - Callback function invoked when the "Login / Sign Up" button is clicked.
 * It should handle navigation to the appropriate authentication page (e.g., by passing 'login' or 'signup').
 * @returns {JSX.Element} The authentication redirector UI.
 */
const AuthRedirector = ({ message, onNavigateToAuth }) => (
  <div className="container mx-auto text-center py-16 sm:py-20 px-4">
    {/* User icon as a visual cue */}
    <UserCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-400 mb-6" />
    {/* Message prompting user action */}
    <p className="text-xl sm:text-2xl text-gray-700 mb-6">{message}</p>
    {/* Button to navigate to login/signup page */}
    <button
      // Assuming onNavigateToAuth can take a parameter like 'login' or 'signup'
      // to direct to the correct part of the authentication flow.
      onClick={() => onNavigateToAuth("login")}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all"
      aria-label="Login or Sign Up"
    >
      Login / Sign Up
    </button>
  </div>
);

export default AuthRedirector;
