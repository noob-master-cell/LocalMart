// project/src/components/UI/ErrorBoundary.jsx
import React from "react";

/**
 * @class ErrorBoundary
 * @extends React.Component
 * @description A React component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the crashed component tree.
 *
 * @param {object} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The child components that this boundary will protect.
 * @param {Function} [props.fallbackRender] - Optional render prop to customize the fallback UI. Receives error and errorInfo.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    /**
     * @property {object} state - The internal state of the ErrorBoundary.
     * @property {boolean} state.hasError - True if an error has been caught.
     * @property {Error|null} state.error - The caught error object.
     * @property {object|null} state.errorInfo - An object with a componentStack key containing information about which component crashed.
     * @property {string|null} state.eventId - A unique ID generated for the error event, useful for tracking.
     */
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null, // For potential error reporting reference
    };
  }

  /**
   * @static
   * @function getDerivedStateFromError
   * @description This lifecycle method is invoked after an error has been thrown by a descendant component.
   * It receives the error that was thrown as a parameter and should return a value to update state.
   * @param {Error} error - The error thrown by the descendant component.
   * @returns {object} An object to update the state, indicating an error has occurred.
   */
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  /**
   * @function componentDidCatch
   * @description This lifecycle method is invoked after an error has been thrown by a descendant component.
   * It receives two parameters: the error and information about the component stack.
   * Used for side effects like logging the error.
   * @param {Error} error - The error that was caught.
   * @param {object} errorInfo - An object containing the componentStack.
   */
  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
      eventId: Date.now().toString(), // Generate a simple event ID
    });

    // Example: Send error to a service like Sentry in production
    if (process.env.NODE_ENV === "production") {
      // Sentry.captureException(error, { extra: errorInfo, tags: { eventId: this.state.eventId } });
    }
  }

  /**
   * @function handleReload
   * @description Reloads the current page.
   */
  handleReload = () => {
    window.location.reload();
  };

  /**
   * @function handleGoHome
   * @description Navigates the user to the home page.
   */
  handleGoHome = () => {
    window.location.href = "/"; // Or use react-router history if available
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      // Check if a custom fallback UI render prop is provided
      if (typeof this.props.fallbackRender === "function") {
        return this.props.fallbackRender({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          eventId: this.state.eventId,
          onReload: this.handleReload,
          onGoHome: this.handleGoHome,
        });
      }

      // Default fallback UI
      return (
        <div
          className="min-h-screen flex items-center justify-center bg-gray-100 px-4"
          role="alert"
        >
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              {/* Error Icon */}
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try
              reloading the page or returning home.
            </p>
            {/* Display error details in development mode */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-4 text-left bg-gray-50 p-2 rounded border">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium">
                  Error Details (Development Mode)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                  <pre>
                    <strong>Error:</strong> {this.state.error.toString()}
                  </pre>
                  <pre>
                    <strong>Stack Trace:</strong>{" "}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Go Home
              </button>
            </div>
            {/* Display Event ID for support reference */}
            {this.state.eventId && (
              <p className="text-xs text-gray-400 mt-4">
                Error ID: {this.state.eventId}
              </p>
            )}
          </div>
        </div>
      );
    }

    // If no error, render children as normal
    return this.props.children;
  }
}

export default ErrorBoundary;