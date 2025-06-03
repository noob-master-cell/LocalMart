// src/AppWrapper.jsx
import React, { useState, useCallback, useEffect } from "react";
import { BrowserRouter } from "react-router-dom"; // For client-side routing
import AppLayout from "./AppLayout.jsx"; // Main application layout component
import MessageBar from "./components/UI/MessageBar.jsx"; // For displaying global messages
import ErrorBoundary from "./components/UI/ErrorBoundary.jsx"; // Catches JS errors in children
import useAuth from "./hooks/useAuth.jsx"; // Custom hook for authentication state
import useAppStore from "./store/appStore.js"; // Zustand store for global app state
import optimizedFirebaseService from "./services/firebaseService.js"; // Service for Firebase interactions
import { signOut } from "firebase/auth"; // Firebase auth function
import { auth } from "./firebase.jsx"; // Firebase auth instance

/**
 * @function AppWrapper
 * @description Top-level application component that sets up routing, global state,
 * error handling, authentication, and global event listeners.
 * It wraps the AppLayout with necessary providers and global UI elements like MessageBar.
 * @returns {JSX.Element} The main application structure.
 */
function AppWrapper() {
  // State for the global message bar
  const [message, setMessage] = useState({
    text: "",
    type: "info", // 'info', 'success', 'error', 'warning'
    shareData: null, // Optional data for Web Share API
    duration: 5000, // Auto-dismiss duration in ms
    autoDismiss: true, // Whether the message auto-dismisses
    position: "bottom-right", // Position of the message bar
  });

  // Authentication state from custom hook
  const { user, isAuthReady } = useAuth(); // `user` is the Firebase user object, `isAuthReady` signals auth state initialization

  // Zustand store's setUser action
  const setUserInStore = useAppStore((state) => state.setUser); // Renamed to avoid conflict

  // Effect to update user in Zustand store when Firebase auth state changes
  useEffect(() => {
    setUserInStore(user);
  }, [user, setUserInStore]);

  /**
   * Displays a global message using the MessageBar component.
   * @param {string} text - The message text.
   * @param {string} [type="info"] - The type of message ('info', 'success', 'error', 'warning').
   * @param {object} [options={}] - Additional options for the message bar (duration, autoDismiss, shareData, position).
   * @type {Function}
   */
  const showGlobalMessage = useCallback((text, type = "info", options = {}) => {
    const {
      shareData = null,
      duration = 5000,
      autoDismiss = true,
      position = "bottom-right", // Default position
    } = options;

    setMessage({ text, type, shareData, duration, autoDismiss, position });
  }, []); // No dependencies, this function is stable

  /**
   * Dismisses the current global message by resetting its state.
   * @type {Function}
   */
  const dismissMessage = useCallback(() => {
    setMessage({
      // Reset to default/empty state
      text: "",
      type: "info",
      shareData: null,
      duration: 5000,
      autoDismiss: true,
      position: "bottom-right",
    });
  }, []); // No dependencies

  /**
   * Handles user logout using Firebase signOut.
   * Displays a success or error message.
   * @type {Function}
   */
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      showGlobalMessage("Logged out successfully.", "success", {
        duration: 3000,
        // Example: Share data for promoting the app after logout
        shareData: {
          title: "LocalMart - Community Marketplace",
          text: "Check out LocalMart, your local community marketplace!",
          url: window.location.origin,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      showGlobalMessage(`Logout error: ${error.message}`, "error", {
        duration: 8000, // Longer duration for error messages
        autoDismiss: true,
      });
    }
  };

  // Effect for setting up and tearing down global event listeners
  useEffect(() => {
    /** Handles online network status change. */
    const handleOnline = () => {
      showGlobalMessage("You're back online!", "success", { duration: 3000 });
      // Attempt to retry any operations that failed while offline
      optimizedFirebaseService.retryPendingOperations();
    };

    /** Handles offline network status change. */
    const handleOffline = () => {
      showGlobalMessage(
        "You're offline. Some features may not work as expected.",
        "warning",
        {
          duration: 0, // Persist until dismissed or back online
          autoDismiss: false,
        }
      );
    };

    /** Handles the 'beforeinstallprompt' event for PWA installation. */
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Prevent the default browser install prompt
      // Optionally, show a custom install promotion UI or message
      showGlobalMessage("Install LocalMart for a better experience!", "info", {
        duration: 10000, // Show for 10 seconds
        // shareData could be used to trigger a custom install flow via MessageBar
      });
      // Stash the event so it can be triggered later: window.deferredInstallPrompt = e;
    };

    /** Placeholder for periodic performance monitoring or health checks. */
    const handlePerformanceIssue = () => {
      if (process.env.NODE_ENV === "development") {
        // Only run in development
        const health = optimizedFirebaseService.getHealthStatus();

        if (health.cacheSize > 800) {
          // Example: Check cache size
          console.warn(
            "Large cache size detected, consider strategies for cleanup."
          );
        }
      }
    };

    /**
     * Handles custom 'itemSuccess' events dispatched within the app.
     * @param {CustomEvent} event - The custom event containing action, item, and user details.
     */
    const handleItemSuccess = (event) => {
      const { action, item, user: eventUser } = event.detail; // Extract details from the event
      let messageText = "";
      let shareDataPayload = null;

      switch (action) {
        case "item_sold":
          messageText = `"${item.name}" marked as sold!`;
          shareDataPayload = {
            /* ... */
          };
          break;
        case "item_found":
          messageText = `"${item.name}" marked as found! Great job helping the community.`;
          shareDataPayload = {
            /* ... */
          };
          break;
        case "profile_updated":
          messageText = "Profile updated successfully!";
          break;
        default:
          messageText = "Action completed successfully!";
      }
      showGlobalMessage(messageText, "success", {
        shareData: shareDataPayload,
      });
    };

    // Add global event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("itemSuccess", handleItemSuccess); // Listen for custom app events

    // Set up an interval for performance monitoring (example)
    const perfInterval = setInterval(handlePerformanceIssue, 30000); // Check every 30 seconds

    // Cleanup function to remove event listeners and clear intervals on component unmount
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("itemSuccess", handleItemSuccess);
      clearInterval(perfInterval);
    };
  }, [showGlobalMessage]); // Dependency: showGlobalMessage (stable due to useCallback)

  // Effect for cleaning up Firebase service connections on unmount
  useEffect(() => {
    return () => {
      optimizedFirebaseService.cleanup(); // Perform any necessary cleanup for the Firebase service
    };
  }, []); // Run once on mount, cleanup on unmount

  // Display a loading screen while Firebase authentication state is being initialized
  if (!isAuthReady) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100 text-center px-4">
        <div className="relative mb-6">
          {/* Enhanced loading spinner visuals */}
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          {/* Secondary spinner for visual flair */}
          <div className="absolute inset-0 rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-200 animate-spin-slow"></div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-xl text-gray-700 font-medium">
            Initializing LocalMart...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Just a moment, setting up your marketplace experience.
          </p>
        </div>
        {/* Example of loading tips or engaging content */}
        <div className="mt-8 max-w-md text-center">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Use the search in the header to quickly
              find items across all categories!
            </p>
          </div>
        </div>
        {/* Inline style for the slow-spinning animation (could be moved to CSS file) */}
        <style>
          {`
            @keyframes spin-slow {
              from { transform: rotate(0deg); }
              to { transform: rotate(-360deg); } /* Spin in opposite direction or adjust speed */
            }
            .animate-spin-slow {
              animation: spin-slow 4s linear infinite; /* Slower animation */
            }
          `}
        </style>
      </div>
    );
  }

  // Render the main application structure once auth is ready
  return (
    <ErrorBoundary>
      {" "}
      {/* Top-level error boundary for the entire app */}
      <BrowserRouter>
        {" "}
        {/* Provides routing context */}
        <AppLayout
          user={user}
          handleLogout={handleLogout}
          showGlobalMessage={showGlobalMessage}
        />
        {/* Global MessageBar for notifications */}
        <MessageBar
          message={message.text}
          type={message.type}
          onDismiss={dismissMessage}
          shareData={message.shareData}
          autoDismiss={message.autoDismiss}
          duration={message.duration}
          position={message.position}
        />
        {/* PWA Install Banner (Example: Show if not in standalone mode and user is logged in) */}
        {user && !window.matchMedia("(display-mode: standalone)").matches && (
          <div
            id="install-banner"
            // className "hidden" suggests this might be controlled by JS to show/hide
            className="hidden fixed bottom-20 left-4 right-4 bg-indigo-600 text-white p-4 rounded-lg shadow-lg z-40 md:bottom-4 md:left-auto md:right-4 md:max-w-sm"
            role="complementary"
            aria-labelledby="install-banner-title"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p id="install-banner-title" className="font-medium text-sm">
                  Install LocalMart
                </p>
                <p className="text-xs text-indigo-200">
                  Get faster access to your marketplace.
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                {/* These buttons would need event handlers to trigger PWA installation or dismiss the banner */}
                <button
                  id="install-accept"
                  className="bg-white text-indigo-600 px-3 py-1 rounded text-xs font-medium hover:bg-indigo-50 transition-colors"
                  // onClick={() => window.deferredInstallPrompt?.prompt()}
                >
                  Install
                </button>
                <button
                  id="install-dismiss"
                  className="text-indigo-200 hover:text-white transition-colors"
                  aria-label="Dismiss install banner"
                  // onClick={() => document.getElementById('install-banner').classList.add('hidden')}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default AppWrapper;