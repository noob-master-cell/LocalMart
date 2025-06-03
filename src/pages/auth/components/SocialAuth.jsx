// This component renders social authentication options, currently focusing on Google Sign-In.
// It displays a separator ("Or continue with") and a button for Google Sign-In.
// The button's text (Sign up/Sign in) adapts based on the current authentication mode.

import React from "react";
// Icon for the Google Sign-In button.
import { GoogleIcon } from "../../../components/Icons";

/**
 * SocialAuth component.
 *
 * @param {object} props - The component's props.
 * @param {boolean} props.isSignupMode - True if the current mode is signup, false for login.
 * Affects the button text (e.g., "Sign up with Google" vs "Sign in with Google").
 * @param {boolean} props.isLoading - True if an authentication operation is in progress,
 * disabling the button.
 * @param {Function} props.onGoogleSignIn - Callback function to initiate Google Sign-In
 * (typically `handleGoogleSignIn` from `useAuthPageLogic`).
 */
const SocialAuth = ({ isSignupMode, isLoading, onGoogleSignIn }) => {
  return (
    <>
      {/* Separator line with "Or continue with" text. */}
      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-3 text-gray-400 text-xs uppercase">
          Or continue with
        </span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* Google Sign-In Button */}
      <button
        type="button" // Important: `type="button"` to prevent form submission if this component is inside a <form>.
        onClick={onGoogleSignIn}
        disabled={isLoading} // Disable button during loading states.
        className="w-full bg-white hover:bg-gray-50 text-gray-600 font-medium py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <GoogleIcon /> {/* Google logo icon. */}
        <span>Sign {isSignupMode ? "up" : "in"} with Google</span>
      </button>

      {/* Placeholder for other social authentication buttons (e.g., Facebook, Apple) if added later.
      <button
        type="button"
        // onClick={onFacebookSignIn} // Example for a Facebook sign-in handler
        disabled={isLoading}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white ..."
      >
        Sign {isSignupMode ? 'up' : 'in'} with Facebook
      </button>
      */}
    </>
  );
};

export default SocialAuth;
