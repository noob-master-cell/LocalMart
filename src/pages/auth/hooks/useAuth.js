// This custom React hook encapsulates the logic for the authentication page (AuthComponent).
// It manages user input (email, password), handles form submission for signup/login,
// processes Google Sign-In, manages error states, and handles navigation upon successful authentication.

import { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation,
  // For react-router-dom v5, it would be useHistory, useLocation. v6 is assumed here.
} from "react-router-dom";
// Firebase imports for authentication and Firestore database interactions.
import {
  auth,             // Firebase Auth instance.
  db,               // Firestore instance.
  appId,            // Application ID for namespacing (e.g., in Firestore paths).
  GoogleAuthProvider, // Provider for Google Sign-In.
  Timestamp,        // Firestore Timestamp for date/time fields.
} from "../../../firebase.jsx"; // Adjust path to your Firebase config file.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup, // For Google Sign-In.
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // For user profile management in Firestore.

/**
 * Custom hook for managing authentication page logic.
 *
 * @param {boolean} isSignupMode - Flag indicating if the current mode is signup (true) or login (false).
 * This is typically determined by the route.
 * @returns {object} An object containing state and functions for the authentication page.
 */
const useAuthPageLogic = (isSignupMode) => {
  // State for user inputs.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // State for authentication errors.
  const [error, setError] = useState("");
  // State to indicate if an authentication operation is in progress.
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); // Hook for programmatic navigation.
  const location = useLocation(); // Hook to get current location (e.g., for redirect after login).

  /**
   * Handles successful authentication.
   * Redirects the user to their previous page or to the home page.
   * @param {object} userCredential - The user credential object from Firebase Auth.
   */
  const handleAuthSuccess = (userCredential) => {
    // User profile creation/checking in Firestore is handled within
    // `handleEmailPasswordSubmit` (for email signup) and `handleGoogleSignIn`.
    // Determine the redirect path: from location state or default to home ('/').
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true }); // `replace: true` prevents going back to auth page.
    // Global context/store updates (e.g., Zustand store) would typically be triggered
    // by the main `useAuth` hook listening to `onAuthStateChanged`.
  };

  /**
   * Handles email/password authentication (signup or login).
   * @param {Event} [e] - The form submission event (optional).
   */
  const handleEmailPasswordSubmit = async (e) => {
    if (e) e.preventDefault(); // Prevent default form submission.
    setError(""); // Clear previous errors.
    setIsLoading(true);
    try {
      let userCredential;
      if (isSignupMode) { // --- Signup ---
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create a user profile document in Firestore for new email signups.
        const user = userCredential.user;
        const userDocRef = doc(db, `artifacts/${appId}/users`, user.uid); // Path to user's document.
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) { // Create profile if it doesn't exist.
          await setDoc(userDocRef, {
            email: user.email,
            displayName: user.email, // Default displayName to email.
            createdAt: Timestamp.now(), // Record creation time.
            provider: "email/password", // Authentication provider.
            photoURL: null, // No photo URL for email signup by default.
          });
        }
      } else { // --- Login ---
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      handleAuthSuccess(userCredential); // Handle successful auth.
    } catch (err) {
      // Provide user-friendly error messages.
      setError(
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
          ? "Invalid email or password."
          : err.message // Fallback to Firebase error message.
      );
      console.error("Email/Password Auth error in useAuthPageLogic:", err);
    }
    setIsLoading(false);
  };

  /**
   * Handles Google Sign-In.
   */
  const handleGoogleSignIn = async () => {
    setError(""); // Clear previous errors.
    setIsLoading(true);
    const provider = new GoogleAuthProvider(); // Google Auth provider.
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Create/update user profile in Firestore for Google Sign-In users.
      const userDocRef = doc(db, `artifacts/${appId}/users`, user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) { // Create profile if it doesn't exist.
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          createdAt: Timestamp.now(),
          provider: "google.com", // Authentication provider.
          photoURL: user.photoURL,
        });
      }
      // If it exists, you might want to update `displayName` or `photoURL` if they've changed.
      // else { await updateDoc(userDocRef, { displayName: user.displayName, photoURL: user.photoURL, lastLogin: Timestamp.now() }); }

      handleAuthSuccess(result); // Handle successful auth.
    } catch (err) {
      setError(err.message);
      console.error("Google Sign-In error in useAuthPageLogic:", err);
    }
    setIsLoading(false);
  };

  /**
   * Toggles the authentication mode between signup and login by navigating.
   */
  const toggleAuthMode = () => {
    setError(""); // Clear errors when toggling mode.
    if (isSignupMode) {
      // If currently on signup page, navigate to login.
      // Preserve location state for potential redirect after login.
      navigate("/auth/login", { state: location.state, replace: true });
    } else {
      // If currently on login page, navigate to signup.
      navigate("/auth/signup", { state: location.state, replace: true });
    }
  };

  // Return state and handler functions to be used by the AuthComponent.
  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleEmailPasswordSubmit,
    handleGoogleSignIn,
    toggleAuthMode,
    // `isSignupMode` is passed as a prop to the hook, so the component determines it from the route.
  };
};

export default useAuthPageLogic;