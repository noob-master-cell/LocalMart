// This component renders the email and password form for authentication (signup or login).
// It includes input fields for email and password, displays any form-specific errors,
// and provides a submit button whose text adapts to the current mode (signup/login) and loading state.

import React from "react";

/**
 * AuthForm component for email/password authentication.
 *
 * @param {object} props - The component's props.
 * @param {boolean} props.isSignupMode - True if the form is for signup, false for login.
 * Affects button text and password input's `autoComplete` attribute.
 * @param {string} props.email - Current value of the email input.
 * @param {Function} props.setEmail - Function to update the email state.
 * @param {string} props.password - Current value of the password input.
 * @param {Function} props.setPassword - Function to update the password state.
 * @param {string} props.error - Error message specific to this form (e.g., "Invalid email or password").
 * @param {boolean} props.isLoading - True if an authentication operation is in progress.
 * @param {Function} props.onSubmit - Callback function to handle form submission
 * (typically `handleEmailPasswordSubmit` from `useAuthPageLogic`).
 */
const AuthForm = ({
  isSignupMode,
  email,
  setEmail,
  password,
  setPassword,
  error,
  isLoading,
  onSubmit,
}) => {
  return (
    // HTML form element with an onSubmit handler.
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Display form-specific errors if any. */}
      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center">
          {error}
        </p>
      )}

      {/* Email Input Field */}
      <div>
        <label
          className="block text-gray-700 text-sm font-medium mb-1"
          htmlFor="email-auth" // Unique ID for the email input.
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
          required // HTML5 validation: field must be filled.
          autoComplete="email" // Helps browsers auto-fill email.
          disabled={isLoading} // Disable input during loading.
        />
      </div>

      {/* Password Input Field */}
      <div>
        <label
          className="block text-gray-700 text-sm font-medium mb-1"
          htmlFor="password-auth" // Unique ID for the password input.
        >
          Password
        </label>
        <input
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          id="password-auth"
          type="password"
          placeholder="••••••••" // Placeholder for password.
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required // HTML5 validation.
          // `autoComplete` helps password managers; "new-password" for signup, "current-password" for login.
          autoComplete={isSignupMode ? "new-password" : "current-password"}
          disabled={isLoading} // Disable input during loading.
        />
      </div>

      {/* Password requirements hint for signup mode. */}
      {isSignupMode && (
        <p className="text-xs text-gray-500">
          Password should be at least 6 characters.
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading} // Disable button during loading.
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {/* Dynamically set button text based on loading state and mode. */}
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