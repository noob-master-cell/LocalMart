// This file initializes and configures the Firebase SDK for the application.
// It exports the necessary Firebase services (app, auth, db, storage, analytics)
// and other utilities like GoogleAuthProvider and Timestamp.

import { initializeApp } from "firebase/app"; // Core Firebase app initialization.
import { getAnalytics } from "firebase/analytics"; // Firebase Analytics service.
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Firebase Authentication service and Google provider.
import { getFirestore, Timestamp } from "firebase/firestore"; // Firestore database service and Timestamp utility.
import {
  getStorage,
  ref, // Firebase Storage reference utility.
  uploadBytes, // Firebase Storage function for uploading files.
  getDownloadURL, // Firebase Storage function to get a file's download URL.
  deleteObject, // Firebase Storage function to delete a file.
} from "firebase/storage";

// Firebase project configuration object.
// These values are typically stored in environment variables (e.g., .env file)
// and accessed via `import.meta.env` in Vite projects.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // For Google Analytics
};

// Initialize the Firebase app with the provided configuration.
// This `app` object is the entry point for all Firebase services.
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics (if configured and VITE_FIREBASE_MEASUREMENT_ID is present).
// It's good practice to initialize it, even if not actively used yet, for future data collection.
const analytics = getAnalytics(app);

// Get instances of Firebase services, associating them with the initialized `app`.
const authInstance = getAuth(app); // Firebase Authentication service instance.
const dbInstance = getFirestore(app); // Firestore database service instance.
const storageInstance = getStorage(app); // Firebase Storage service instance.

// Application identifier, potentially for multi-tenant setups or specific app contexts.
// `__app_id` might be a global variable injected during build or from server-side.
// Defaults to "default-marketplace-app" if `__app_id` is not defined.
const appIdentifier =
  typeof __app_id !== "undefined" ? __app_id : "default-marketplace-app";

// Export the initialized services and utilities for use throughout the application.
export {
  app, // The core Firebase app instance.
  authInstance as auth, // Firebase Auth service (aliased as `auth`).
  dbInstance as db, // Firestore service (aliased as `db`).
  storageInstance as storage, // Firebase Storage service (aliased as `storage`).
  analytics, // Firebase Analytics service.
  appIdentifier as appId, // Application identifier (aliased as `appId`).
  GoogleAuthProvider, // Google Authentication provider for Firebase Auth.
  Timestamp, // Firestore Timestamp utility for date/time fields.
  // Firebase Storage utilities:
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
};
