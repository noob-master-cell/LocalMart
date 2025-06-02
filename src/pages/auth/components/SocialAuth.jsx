// src/pages/authPage/components/SocialAuth.jsx

import React from "react";
import GoogleIcon from "./../../../components/icons/GoogleIcon";

const SocialAuth = ({
  isSignupMode, // To adjust button text e.g., "Sign up with Google" vs "Sign in with Google"
  isLoading, // To disable the button during an auth operation
  onGoogleSignIn, // The callback function (handleGoogleSignIn from useAuthPageLogic)
}) => {
  return (
    <>
      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-3 text-gray-400 text-xs uppercase">
          Or continue with
        </span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* Google Sign-In Button */}
      <button
        type="button" // Important: type="button" to prevent form submission if inside a form
        onClick={onGoogleSignIn}
        disabled={isLoading}
        className="w-full bg-white hover:bg-gray-50 text-gray-600 font-medium py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <GoogleIcon />
        <span>Sign {isSignupMode ? "up" : "in"} with Google</span>
      </button>

      {/* Placeholder for other social auth buttons if you add them later
      <button
        type="button"
        // onClick={onFacebookSignIn}
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
