// src/pages/authPage/hooks/useAuth.js

import { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation,
  // Assuming react-router-dom v6. For v5, it would be useHistory, useLocation
} from "react-router-dom";
import {
  auth, // Firebase auth instance
  db, // Firestore instance
  appId, // Your appID
  GoogleAuthProvider,
  Timestamp,
} from "../../../firebase.jsx"; // Adjust path to your firebase config
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// This hook manages the logic for the AuthComponent page
const useAuthPageLogic = (isSignupMode) => {
  // Pass isSignupMode to determine behavior
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthSuccess = (userCredential) => {
    // You might want to create/check user profile in Firestore here if not handled elsewhere
    // For Google Sign-In, profile creation was in the original AuthComponent
    const from = location.state?.from?.pathname || "/"; // Redirect to previous page or home
    navigate(from, { replace: true });
    // Potentially call a global context/store update if needed, though global useAuth should pick it up
  };

  const handleEmailPasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      let userCredential;
      if (isSignupMode) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Optionally create user profile in Firestore here for email signup
        const user = userCredential.user;
        const userDocRef = doc(db, `artifacts/${appId}/users`, user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            email: user.email,
            displayName: user.email, // Default display name
            createdAt: Timestamp.now(),
            provider: "email/password", // Or however you track this
            photoURL: null,
          });
        }
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }
      handleAuthSuccess(userCredential);
    } catch (err) {
      setError(
        err.code === "auth/invalid-credential" ||
          err.code === "auth/wrong-password" ||
          err.code === "auth/user-not-found"
          ? "Invalid email or password."
          : err.message
      );
      console.error("Email/Password Auth error in useAuthPageLogic:", err);
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Firestore user profile creation/check (as in original AuthComponent)
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
      }
      handleAuthSuccess(result);
    } catch (err) {
      setError(err.message);
      console.error("Google Sign-In error in useAuthPageLogic:", err);
    }
    setIsLoading(false);
  };

  const toggleAuthMode = () => {
    setError(""); // Clear errors when toggling
    if (isSignupMode) {
      // If currently on signup page, navigate to login
      navigate("/auth/login", { state: location.state, replace: true }); // Corrected path
    } else {
      // If currently on login page, navigate to signup
      navigate("/auth/signup", { state: location.state, replace: true }); // Corrected path
    }
  };

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
    // isSignupMode // The component will determine this from the route
  };
};

export default useAuthPageLogic;
