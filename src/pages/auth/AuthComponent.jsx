// src/pages/auth/AuthComponent.jsx
import React from "react";
import { useParams } from "react-router-dom";

import useAuthPageLogic from "./hooks/useAuth.js";
import AuthBranding from "./components/AuthBranding.jsx";
import AuthForm from "./components/AuthForm.jsx";
import SocialAuth from "./components/SocialAuth.jsx";
import HomeIcon from "../../components/Icons/HomeIcon.jsx";

/**
 * AuthComponent - The main authentication page component.
 */
const AuthComponent = () => {
  const { action } = useParams();
  const isSignupMode = action === "signup";

  const {
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
    error,
    isLoading,
    handleEmailPasswordSubmit,
    handleGoogleSignIn,
    toggleAuthMode,
  } = useAuthPageLogic(isSignupMode);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
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
            displayName={displayName}
            setDisplayName={setDisplayName}
            error={error}
            isLoading={isLoading}
            onSubmit={handleEmailPasswordSubmit}
          />

          {/* Social Authentication Options */}
          <SocialAuth
            isSignupMode={isSignupMode}
            isLoading={isLoading}
            onGoogleSignIn={handleGoogleSignIn}
          />

          {/* Toggle between Login and Signup views */}
          <p className="text-center text-gray-600 mt-8 text-sm">
            {isSignupMode ? "Already have an account? " : "New to LocalMart? "}
            <button
              onClick={toggleAuthMode}
              className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline focus:outline-none"
              disabled={isLoading}
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
