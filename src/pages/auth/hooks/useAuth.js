// src/pages/auth/hooks/useAuth.js
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  auth,
  db,
  appId,
  GoogleAuthProvider,
  Timestamp,
} from "../../../firebase.jsx";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * Custom hook for managing authentication page logic.
 *
 * @param {boolean} isSignupMode - Flag indicating if the current mode is signup (true) or login (false).
 * @returns {object} An object containing state and functions for the authentication page.
 */
const useAuthPageLogic = (isSignupMode) => {
  // State for user inputs.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(""); // New state for display name
  // State for authentication errors.
  const [error, setError] = useState("");
  // State to indicate if an authentication operation is in progress.
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Handles successful authentication.
   * Redirects the user to their previous page or to the home page.
   * @param {object} userCredential - The user credential object from Firebase Auth.
   */
  const handleAuthSuccess = (userCredential) => {
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  };

  /**
   * Handles email/password authentication (signup or login).
   * @param {Event} [e] - The form submission event (optional).
   */
  const handleEmailPasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let userCredential;

      if (isSignupMode) {
        // --- Signup ---
        // Validate display name for signup
        if (!displayName.trim()) {
          setError("Full name is required for signup.");
          setIsLoading(false);
          return;
        }

        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Update the user's profile with the display name
        await updateProfile(user, {
          displayName: displayName.trim(),
        });

        // Create a user profile document in Firestore
        const userDocRef = doc(db, `artifacts/${appId}/users`, user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            email: user.email,
            displayName: displayName.trim(),
            createdAt: Timestamp.now(),
            provider: "email/password",
            photoURL: null,
          });
        }
      } else {
        // --- Login ---
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      handleAuthSuccess(userCredential);
    } catch (err) {
      // Provide user-friendly error messages.
      if (err.code === "auth/email-already-in-use") {
        setError(
          "An account with this email already exists. Please sign in instead."
        );
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password.");
      } else {
        setError(err.message);
      }
      console.error("Email/Password Auth error in useAuthPageLogic:", err);
    }
    setIsLoading(false);
  };

  /**
   * Handles Google Sign-In.
   */
  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create/update user profile in Firestore for Google Sign-In users.
      const userDocRef = doc(db, `artifacts/${appId}/users`, user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          createdAt: Timestamp.now(),
          provider: "google.com",
          photoURL: user.photoURL,
        });
      } else {
        // Update display name and photo if they've changed
        const existingData = userDocSnap.data();
        if (
          existingData.displayName !== user.displayName ||
          existingData.photoURL !== user.photoURL
        ) {
          await setDoc(
            userDocRef,
            {
              displayName: user.displayName,
              photoURL: user.photoURL,
              lastLogin: Timestamp.now(),
            },
            { merge: true }
          );
        }
      }

      handleAuthSuccess(result);
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
    setError("");
    // Clear the display name when switching modes
    setDisplayName("");

    if (isSignupMode) {
      navigate("/auth/login", { state: location.state, replace: true });
    } else {
      navigate("/auth/signup", { state: location.state, replace: true });
    }
  };

  return {
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
  };
};

export default useAuthPageLogic;
