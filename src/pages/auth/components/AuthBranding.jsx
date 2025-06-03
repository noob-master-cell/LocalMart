// This component displays branding information on the authentication page.
// It's typically shown on larger screens alongside the authentication form.
// It includes the application name, a tagline, and a mode-specific welcome message.

import React from "react";
// Icon representing the application or home.
import { HomeIcon } from "../../../components/Icons";

/**
 * AuthBranding component.
 *
 * @param {object} props - The component's props.
 * @param {boolean} props.isSignupMode - True if the current mode is signup, false for login.
 * This allows for customizing messages (e.g., "Create an account" vs "Sign in").
 */
const AuthBranding = ({ isSignupMode }) => {
  // The `isSignupMode` prop can be used to tailor messages if needed,
  // for example, by changing the paragraph text based on whether the user is signing up or logging in.
  return (
    // This section is hidden on smaller screens (md:flex shows it on medium screens and up).
    <div className="hidden md:flex flex-col items-center justify-center text-center p-8">
      {/* Application Icon */}
      <HomeIcon className="w-24 h-24 text-indigo-600 mb-6" />
      {/* Application Name */}
      <h1 className="text-5xl font-extrabold text-gray-900">LocalMart</h1>
      {/* Tagline */}
      <p className="mt-4 text-xl text-gray-600">
        Your Community Marketplace & Lost & Found Hub.
      </p>
      {/* Mode-specific welcome message */}
      <p className="mt-2 text-md text-gray-500">
        {isSignupMode
          ? "Create an account to start buying, selling, and helping your neighbors!"
          : "Sign in to access your account and continue exploring."}
      </p>
    </div>
  );
};

export default AuthBranding;
