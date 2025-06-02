// src/pages/authPage/components/AuthForm.jsx

import React from "react";

const AuthForm = ({
  isSignupMode, // To adjust button text and potentially help text
  email,
  setEmail,
  password,
  setPassword,
  error, // Local form error from useAuthPageLogic
  isLoading,
  onSubmit, // This will be handleEmailPasswordSubmit from useAuthPageLogic
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && ( // Display local form errors
        <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center">
          {error}
        </p>
      )}
      <div>
        <label
          className="block text-gray-700 text-sm font-medium mb-1"
          htmlFor="email-auth" // Changed id to avoid collision if multiple forms exist
        >
          Email Address
        </label>
        <input
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          id="email-auth"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={isLoading}
        />
      </div>
      <div>
        <label
          className="block text-gray-700 text-sm font-medium mb-1"
          htmlFor="password-auth" // Changed id
        >
          Password
        </label>
        <input
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          id="password-auth"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={isSignupMode ? "new-password" : "current-password"}
          disabled={isLoading}
        />
      </div>
      {isSignupMode && (
        <p className="text-xs text-gray-500">
          Password should be at least 6 characters.
        </p>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading
          ? isSignupMode
            ? "Creating Account..."
            : "Logging In..."
          : isSignupMode
          ? "Sign Up with Email"
          : "Login with Email"}
      </button>
    </form>
  );
};

export default AuthForm;
