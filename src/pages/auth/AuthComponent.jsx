// src/pages/authPage/AuthComponent.jsx

import React from "react";
import { useLocation, useParams } from "react-router-dom"; // Or however you determine the auth action

// Feature-specific hook
import useAuthPageLogic from "./hooks/useAuth.js"; // Path relative to src/pages/authPage/

// Presentational components for this feature
import AuthBranding from "./components/AuthBranding.jsx";
import AuthForm from "./components/AuthForm.jsx";
import SocialAuth from "./components/SocialAuth.jsx";

import HomeIcon from "./../../components/icons/HomeIcon";

const AuthComponent = () => {
  // Determine if it's signup or login mode based on the route
  // This depends on how your routes are set up.
  // If using a param like /authPage/:action
  const { action } = useParams(); // from react-router-dom
  const isSignupMode = action === "signup";

  // Or if you just check the pathname
  // const location = useLocation();
  // const isSignupMode = location.pathname.includes('/signup');

  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleEmailPasswordSubmit,
    handleGoogleSignIn,
    toggleAuthMode, // Provided by useAuthPageLogic to switch between login/signup views
  } = useAuthPageLogic(isSignupMode); // Pass isSignupMode to the hook

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 md:grid md:grid-cols-2 md:gap-16 md:items-center">
        {/* Left Column: Branding (uses AuthBranding component) */}
        <AuthBranding isSignupMode={isSignupMode} />

        {/* Right Column: Form Area */}
        <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl">
          {/* Mobile Header (if needed, similar to original) */}
          <div className="md:hidden flex flex-col items-center text-center mb-6">
            <HomeIcon className="w-16 h-16 text-indigo-600 mb-3" />
            <h2 className="text-3xl font-bold text-gray-900">LocalMart</h2>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            {isSignupMode ? "Create your Account" : "Welcome Back!"}
          </h2>
          <p className="text-center text-sm text-gray-600 mb-6">
            {isSignupMode
              ? "Join our community today."
              : "Sign in to continue."}
          </p>

          {/* AuthForm Component */}
          <AuthForm
            isSignupMode={isSignupMode}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            error={error}
            isLoading={isLoading}
            onSubmit={handleEmailPasswordSubmit}
          />

          {/* SocialAuth Component (Google Sign-In and "OR" separator) */}
          <SocialAuth
            isSignupMode={isSignupMode}
            isLoading={isLoading}
            onGoogleSignIn={handleGoogleSignIn}
          />

          {/* Toggle between Login/Signup */}
          <p className="text-center text-gray-600 mt-8 text-sm">
            {isSignupMode ? "Already have an account? " : "New to LocalMart? "}
            <button
              onClick={toggleAuthMode} // Uses the function from useAuthPageLogic
              className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline focus:outline-none"
              disabled={isLoading} // Disable while loading
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
