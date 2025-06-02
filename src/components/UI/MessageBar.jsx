// project/src/components/UI/MessageBar.jsx
import React, { useState, useEffect, useCallback } from "react";
import XCircleIcon from "../icons/XCircleIcon";

const MessageBar = ({
  message,
  type = "info",
  onDismiss,
  autoDismiss = true,
  duration = 5000,
  shareData = null,
  position = "bottom-right",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Define handleDismiss BEFORE the useEffect that depends on it
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300); // Animation duration
  }, [onDismiss]); // onDismiss is a dependency of handleDismiss

  // Show animation when message appears
  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setIsExiting(false);
    }
  }, [message]);

  // Auto-dismiss functionality
  useEffect(() => {
    if (!message || !autoDismiss) return;

    const timer = setTimeout(() => {
      handleDismiss(); // Now handleDismiss is defined
    }, duration);

    return () => clearTimeout(timer);
  }, [message, autoDismiss, duration, handleDismiss]);
  const handleShare = useCallback(async () => {
    if (!shareData) return;

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        const shareText = `${shareData.title || ""}\n${shareData.text || ""}\n${
          shareData.url || ""
        }`; // Ensure properties exist
        await navigator.clipboard.writeText(shareText);
        // Could show a brief "Copied!" message here
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Optionally show an error message to the user
    }
  }, [shareData]);

  if (!message && !isVisible) return null; // Keep rendering during exit animation

  // Color schemes for different message types
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-600",
          border: "border-green-500",
          icon: "text-green-100",
          text: "text-white",
        };
      case "error":
        return {
          bg: "bg-red-600",
          border: "border-red-500",
          icon: "text-red-100",
          text: "text-white",
        };
      case "warning":
        return {
          bg: "bg-yellow-500",
          border: "border-yellow-400",
          icon: "text-yellow-100", // Changed from text-yellow-100 to ensure visibility on yellow-500
          text: "text-white", // Assuming white text is desired on yellow-500
        };
      case "info":
      default:
        return {
          bg: "bg-blue-600",
          border: "border-blue-500",
          icon: "text-blue-100",
          text: "text-white",
        };
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg" // Added xmlns
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "error":
        return (
          // Using XCircleIcon for consistency with dismiss button
          // but if a different visual is preferred, original SVG is fine.
          // For this example, keeping original distinct error icon:
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg" // Added xmlns
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" // A common error/warning icon
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg" // Added xmlns
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        );
      case "info":
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg" // Added xmlns
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4";
      case "top-right":
        return "top-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-right":
      default:
        return "bottom-4 right-4";
      case "top-center":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "bottom-center":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
    }
  };

  const styles = getTypeStyles();

  return (
    <>
      <div
        className={`fixed ${getPositionClasses()} z-[100] transition-all duration-300 ease-in-out ${
          isVisible && !isExiting
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-2 scale-95 pointer-events-none" // Added pointer-events-none when hidden
        }`}
        style={{ maxWidth: "calc(100vw - 2rem)" }}
        role="alert" // Added role for accessibility
        aria-live={
          type === "error" || type === "warning" ? "assertive" : "polite"
        } // Accessibility
      >
        <div
          className={`${styles.bg} ${styles.border} ${styles.text} p-4 rounded-lg shadow-lg border-l-4 max-w-md`}
        >
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 ${styles.icon} mt-0.5`}>
              {getTypeIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-relaxed break-words">
                {message}
              </p>
            </div>

            <div className="flex items-center space-x-1 flex-shrink-0">
              {shareData &&
                navigator.share && ( // Only show share if navigator.share is available
                  <button
                    onClick={handleShare}
                    className={`${styles.icon} hover:bg-white hover:bg-opacity-20 p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50`}
                    title="Share"
                    aria-label="Share this message"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg" // Added xmlns
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                  </button>
                )}
              <button
                onClick={handleDismiss}
                className={`${styles.icon} hover:bg-white hover:bg-opacity-20 p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50`}
                title="Dismiss"
                aria-label="Dismiss message"
              >
                <XCircleIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {autoDismiss && isVisible && !isExiting && (
            <div className="mt-3 bg-white bg-opacity-20 rounded-full h-1 overflow-hidden">
              <div
                className="bg-white h-full rounded-full"
                style={{
                  width: "100%",
                  animation: `progressShrink ${duration}ms linear forwards`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes progressShrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
    </>
  );
};

export default React.memo(MessageBar); // Original file was memoized
