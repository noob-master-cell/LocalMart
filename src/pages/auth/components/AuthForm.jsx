// src/pages/auth/components/AuthForm.jsx
import React from "react";

/**
 * AuthForm component for email/password authentication.
 *
 * @param {object} props - The component's props.
 * @param {boolean} props.isSignupMode - True if the form is for signup, false for login.
 * @param {string} props.email - Current value of the email input.
 * @param {Function} props.setEmail - Function to update the email state.
 * @param {string} props.password - Current value of the password input.
 * @param {Function} props.setPassword - Function to update the password state.
 * @param {string} props.displayName - Current value of the display name input (for signup).
 * @param {Function} props.setDisplayName - Function to update the display name state.
 * @param {string} props.error - Error message specific to this form.
 * @param {boolean} props.isLoading - True if an authentication operation is in progress.
 * @param {Function} props.onSubmit - Callback function to handle form submission.
 */
const AuthForm = ({
  isSignupMode,
  email,
  setEmail,
  password,
  setPassword,
  displayName,
  setDisplayName,
  error,
  isLoading,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Display form-specific errors if any. */}
      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm text-center">
          {error}
        </p>
      )}

      {/* Display Name Input Field (only for signup) */}
      {isSignupMode && (
        <div>
          <label
            className="block text-gray-700 text-sm font-medium mb-1"
            htmlFor="displayName-auth"
          >
            Full Name
          </label>
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            id="displayName-auth"
            type="text"
            placeholder="Enter your full name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required={isSignupMode}
            autoComplete="name"
            disabled={isLoading}
          />
        </div>
      )}

      {/* Email Input Field */}
      <div>
        <label
          className="block text-gray-700 text-sm font-medium mb-1"
          htmlFor="email-auth"
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

      {/* Password Input Field */}
      <div>
        <label
          className="block text-gray-700 text-sm font-medium mb-1"
          htmlFor="password-auth"
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

      {/* Password requirements hint for signup mode. */}
      {isSignupMode && (
        <p className="text-xs text-gray-500">
          Password should be at least 6 characters.
        </p>
      )}

      {/* Submit Button */}
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
