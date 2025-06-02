// This custom React hook provides a global authentication state management solution.
// It listens to Firebase's authentication state changes and makes the current user
// object and authentication readiness status available throughout the application.

import { useState, useEffect } from "react";
import { auth } from "../firebase.jsx"; // Firebase Auth instance.
// `signInWithCustomToken` is imported but not used in the current logic flow.
// It's kept here in case custom token authentication was planned or used previously.
import { onAuthStateChanged, signInWithCustomToken } from "firebase/auth";

/**
 * `useAuth` hook.
 * Manages global authentication state by listening to Firebase Auth.
 *
 * @returns {object} An object containing:
 * `user` (object|null): The current Firebase user object, or null if not authenticated.
 * `isAuthReady` (boolean): True when the initial authentication state check is complete.
 * `authError` (string|null): An error message if an authentication error occurs, otherwise null.
 * `isLoggedIn` (boolean): True if a user is currently logged in, false otherwise.
 */
const useAuth = () => {
  // State for the current authenticated user.
  const [user, setUser] = useState(null);
  // State to indicate if the initial Firebase auth state check has completed.
  // This is useful to prevent rendering parts of the app that depend on auth state
  // before Firebase has had a chance to determine if a user is already logged in
  // (e.g., from a previous session).
  const [isAuthReady, setIsAuthReady] = useState(false);
  // State for storing any authentication-related errors.
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Flag to prevent state updates if the component unmounts while an async operation is pending.
    let isMounted = true;

    // Asynchronous function to initialize authentication, particularly for custom tokens if used.
    // In this specific implementation, `__initial_auth_token` seems to be a placeholder
    // for a server-provided token, but it's not actively being used to sign in.
    const initializeAuth = async () => {
      try {
        // Check for a globally defined initial auth token (e.g., from server-side rendering).
        const token =
          typeof __initial_auth_token !== "undefined"
            ? __initial_auth_token
            : null;

        // If a token exists and no user is currently signed in, attempt custom token sign-in.
        // This part of the logic might be vestigial if custom tokens are not a primary auth method.
        if (token && !auth.currentUser) {
          console.log("useAuth: Attempting custom token sign-in...");
          await signInWithCustomToken(auth, token);
        }
      } catch (error) {
        console.error("useAuth: Custom token error:", error);
        if (isMounted) {
          setAuthError(
            // Provide a more user-friendly message for token mismatch.
            error.code === "auth/custom-token-mismatch"
              ? "Authentication token mismatch. Please try logging in again."
              : error.message
          );
        }
      }
    };

    initializeAuth(); // Call the initialization function.

    // Set up a listener for Firebase authentication state changes.
    // This is the core of Firebase's client-side auth management.
    // `onAuthStateChanged` fires when the user signs in, signs out, or when the token refreshes.
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        // Callback with the current user object (or null).
        if (isMounted) {
          setUser(currentUser); // Update the user state.
          setAuthError(null); // Clear any previous auth errors.

          // Mark authentication as ready once the first state is received.
          if (!isAuthReady) {
            setIsAuthReady(true);
          }
        }
      },
      (error) => {
        // Error callback for the listener itself (rare).
        console.error("useAuth: Auth state change listener error:", error);
        if (isMounted) {
          setAuthError(error.message);
          setIsAuthReady(true); // Still mark as ready, but with an error.
        }
      }
    );

    // Cleanup function: Unsubscribe from the listener when the component unmounts.
    // This prevents memory leaks and errors if the component is removed from the DOM.
    return () => {
      isMounted = false; // Set flag to false to prevent state updates on unmounted component.
      unsubscribe(); // Unsubscribe the Firebase auth listener.
    };
  }, [isAuthReady]); // Dependency: `isAuthReady` ensures parts of this effect related to
  // setting `isAuthReady` run appropriately. The core listener setup
  // should ideally run once on mount.

  // Return the authentication state and a convenience flag for logged-in status.
  return {
    user,
    isAuthReady,
    authError,
    isLoggedIn: !!user, // Boolean flag: true if `user` is not null.
  };
};

export default useAuth;
