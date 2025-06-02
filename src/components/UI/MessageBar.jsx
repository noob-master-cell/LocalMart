// This component displays global messages or notifications to the user (e.g., success, error, info).
// It supports different types, auto-dismissal, and an optional share action.
import React, { useState, useEffect, useCallback } from "react";
// Icon for the dismiss button.
import XCircleIcon from "../icons/XCircleIcon";

/**
 * MessageBar component.
 *
 * @param {object} props - Component props.
 * @param {string} props.message - The text content of the message.
 * @param {string} [props.type="info"] - Type of message ('info', 'success', 'error', 'warning'). Determines styling.
 * @param {Function} [props.onDismiss] - Callback function invoked when the message is dismissed.
 * @param {boolean} [props.autoDismiss=true] - If true, the message automatically dismisses after `duration`.
 * @param {number} [props.duration=5000] - Duration in milliseconds for auto-dismissal.
 * @param {object|null} [props.shareData=null] - Optional data for the Web Share API (if `navigator.share` is available).
 * Should include `title`, `text`, and `url`.
 * @param {string} [props.position="bottom-right"] - Position of the message bar on the screen.
 * @returns {JSX.Element|null} The MessageBar component or null if no message.
 */
const MessageBar = ({
  message,
  type = "info",
  onDismiss,
  autoDismiss = true,
  duration = 5000,
  shareData = null,
  position = "bottom-right", // Default position.
}) => {
  const [isVisible, setIsVisible] = useState(false); // Controls overall visibility and entry animation.
  const [isExiting, setIsExiting] = useState(false); // Controls the exit animation.

  // Callback to handle message dismissal (manual or auto).
  const handleDismiss = useCallback(() => {
    setIsExiting(true); // Trigger exit animation.
    setTimeout(() => {
      setIsVisible(false); // Hide after animation.
      onDismiss?.(); // Call parent's dismiss handler.
    }, 300); // Matches CSS animation duration.
  }, [onDismiss]);

  // Effect to show the message bar when a new message is received.
  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setIsExiting(false); // Reset exiting state for new messages.
    }
  }, [message]);

  // Effect for auto-dismissal.
  useEffect(() => {
    if (!message || !autoDismiss || !isVisible || isExiting) return; // Conditions to run the timer.

    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer); // Cleanup timer on unmount or if dependencies change.
  }, [message, autoDismiss, duration, handleDismiss, isVisible, isExiting]);

  // Callback for the share button. Uses Web Share API if available, otherwise copies to clipboard.
  const handleShare = useCallback(async () => {
    if (!shareData) return;

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard if Web Share API is not supported.
        const shareText = `${shareData.title || ""}\n${shareData.text || ""}\n${shareData.url || ""}`;
        await navigator.clipboard.writeText(shareText.trim());
        // Optionally, show a "Copied!" confirmation.
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Optionally show an error message to the user via another MessageBar or inline.
    }
  }, [shareData]);

  // Do not render if there's no message and it's not currently visible (e.g., during exit animation).
  if (!isVisible && !isExiting) return null;


  // Determines Tailwind CSS classes based on the message type for styling.
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return { bg: "bg-green-600", border: "border-green-500", icon: "text-green-100", text: "text-white" };
      case "error":
        return { bg: "bg-red-600", border: "border-red-500", icon: "text-red-100", text: "text-white" };
      case "warning":
        return { bg: "bg-yellow-500", border: "border-yellow-400", icon: "text-yellow-100", text: "text-white" };
      case "info":
      default:
        return { bg: "bg-blue-600", border: "border-blue-500", icon: "text-blue-100", text: "text-white" };
    }
  };

  // Returns an appropriate SVG icon based on the message type.
  const getTypeIcon = () => {
    // SVG paths for icons (success, error, warning, info).
    // Ensure xmlns="http://www.w3.org/2000/svg" is present on SVGs.
    switch (type) {
      case "success": return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
      case "error": return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case "warning": return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>;
      default: return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  // Determines positioning classes based on the `position` prop.
  const getPositionClasses = () => {
    switch (position) {
      case "top-left": return "top-4 left-4";
      case "top-right": return "top-4 right-4";
      case "bottom-left": return "bottom-4 left-4";
      case "top-center": return "top-4 left-1/2 transform -translate-x-1/2";
      case "bottom-center": return "bottom-4 left-1/2 transform -translate-x-1/2";
      case "bottom-right":
      default: return "bottom-4 right-4";
    }
  };

  const styles = getTypeStyles(); // Get styles for the current message type.

  return (
    <>
      <div
        className={`fixed ${getPositionClasses()} z-[100] transition-all duration-300 ease-in-out ${
          isVisible && !isExiting
            ? "opacity-100 translate-y-0 scale-100" // Enter animation
            : "opacity-0 translate-y-2 scale-95 pointer-events-none" // Exit animation and hide from interactions
        }`}
        style={{ maxWidth: "calc(100vw - 2rem)" }} // Ensure it doesn't overflow viewport width.
        role="alert" // Accessibility: ARIA role.
        aria-live={type === "error" || type === "warning" ? "assertive" : "polite"} // ARIA live region politeness.
      >
        <div className={`${styles.bg} ${styles.border} ${styles.text} p-4 rounded-lg shadow-lg border-l-4 max-w-md`}>
          <div className="flex items-start space-x-3">
            {/* Icon container */}
            <div className={`flex-shrink-0 ${styles.icon} mt-0.5`}>
              {getTypeIcon()}
            </div>

            {/* Message text container */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-relaxed break-words">
                {message}
              </p>
            </div>

            {/* Action buttons (Share, Dismiss) */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              {/* Share button (only if shareData and navigator.share are available) */}
              {shareData && navigator.share && (
                  <button
                    onClick={handleShare}
                    className={`${styles.icon} hover:bg-white hover:bg-opacity-20 p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50`}
                    title="Share"
                    aria-label="Share this message"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                  </button>
              )}
              {/* Dismiss button */}
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

          {/* Auto-dismiss progress bar */}
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

      {/* Inline CSS for the progress bar animation. */}
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

export default React.memo(MessageBar);