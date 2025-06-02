// This component serves as the main page for user authentication (signup and login).
// It determines the current mode (signup or login) based on the URL,
// uses the `useAuthPageLogic` hook for state and logic management,
// and renders the branding, authentication form, social login options,
// and a toggle to switch between signup and login modes.

import React from "react";
import { useParams } from "react-router-dom"; // Hook to access URL parameters.

// Feature-specific custom hook for authentication logic.
import useAuthPageLogic from "./hooks/useAuth.js";

// Presentational sub-components for the authentication page.
import AuthBranding from "./components/AuthBranding.jsx"; // Displays app branding.
import AuthForm from "./components/AuthForm.jsx"; // Renders email/password form.
import SocialAuth from "./components/SocialAuth.jsx"; // Renders social login options (e.g., Google).

// Icon used for mobile header.
import HomeIcon from "./../../components/icons/HomeIcon";

/**
 * AuthComponent - The main authentication page component.
 */
const AuthComponent = () => {
  // Determine if the current mode is signup or login based on the URL parameter.
  // This assumes routes like "/auth/signup" and "/auth/login".
  const { action } = useParams(); // `action` will be "signup" or "login".
  const isSignupMode = action === "signup";

  // Alternative way to determine mode if using path checking instead of params:
  // const location = useLocation();
  // const isSignupMode = location.pathname.includes('/signup');

  // Destructure state and handler functions from the useAuthPageLogic hook.
  // Pass `isSignupMode` to the hook so it can tailor its logic and defaults.
  const {
    email,
    setEmail,
    password,
    setPassword,
    error, // Form-specific errors from the hook.
    isLoading, // Loading state for auth operations.
    handleEmailPasswordSubmit, // Handler for email/password form submission.
    handleGoogleSignIn, // Handler for Google Sign-In.
    toggleAuthMode, // Function to switch between login/signup views.
  } = useAuthPageLogic(isSignupMode);

  return (
    // Full-screen container, centered content.
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Max-width container, responsive grid layout for branding and form. */}
      <div className="max-w-4xl w-full space-y-8 md:grid md:grid-cols-2 md:gap-16 md:items-center">
        {/* Left Column: Branding (visible on medium screens and up). */}
        <AuthBranding isSignupMode={isSignupMode} />

        {/* Right Column: Form Area. */}
        <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl">
          {/* Mobile Header: App icon and name (visible on small screens). */}
          <div className="md:hidden flex flex-col items-center text-center mb-6">
            <HomeIcon className="w-16 h-16 text-indigo-600 mb-3" />
            <h2 className="text-3xl font-bold text-gray-900">LocalMart</h2>
          </div>

          {/* Form Title and Subtitle */}
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            {isSignupMode ? "Create your Account" : "Welcome Back!"}
          </h2>
          <p className="text-center text-sm text-gray-600 mb-6">
            {isSignupMode
              ? "Join our community today."
              : "Sign in to continue."}
          </p>

          {/* Email/Password Authentication Form */}
          <AuthForm
            isSignupMode={isSignupMode}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            error={error} // Pass form-specific error from the hook.
            isLoading={isLoading}
            onSubmit={handleEmailPasswordSubmit}
          />

          {/* Social Authentication Options (e.g., Google Sign-In) */}
          <SocialAuth
            isSignupMode={isSignupMode}
            isLoading={isLoading}
            onGoogleSignIn={handleGoogleSignIn}
          />

          {/* Toggle between Login and Signup views */}
          <p className="text-center text-gray-600 mt-8 text-sm">
            {isSignupMode ? "Already have an account? " : "New to LocalMart? "}
            <button
              onClick={toggleAuthMode} // Uses the function from useAuthPageLogic to navigate.
              className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline focus:outline-none"
              disabled={isLoading} // Disable while an auth operation is loading.
            >
              {isSignupMode ? "Sign In" : "Create an Account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;
