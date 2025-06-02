import React, {
  useState,
  useCallback,
  lazy,
  Suspense,
  useEffect,
  useMemo, // useMemo is imported but not explicitly used. Can be removed if not planned for use.
  useRef,
} from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

// Import components that are always needed
import Header from "./components/Layout/Header";
import MobileNavigation from "./components/Navigation/MobileNavigation/MobileNavigation";
import Footer from "./components/Layout/Footer";
import { PageLoadingSkeleton } from "./components/UI/LoadingSkeletons";

// Lazy load page components for better initial load performance
const ItemPageComponent = lazy(() =>
  import("./pages/itemPage/ItemPageComponent.jsx")
);
const NotFound = lazy(() => import("./components/Navigation/NotFound"));
const AuthComponent = lazy(() => import("./pages/auth/AuthComponent"));
const BuyingSection = lazy(() => import("./pages/buying/BuyingSection"));
const SellingSection = lazy(() => import("./pages/selling/SellingSection"));
const LostAndFoundSection = lazy(() =>
  import("./pages/lostfound/LostAndFoundSection")
);

/**
 * @component SuspenseLoader
 * @description A loader component displayed while lazy-loaded components are being fetched.
 * Uses PageLoadingSkeleton for a consistent loading experience.
 * @param {object} props - The component's props.
 * @param {string} [props.type="buying"] - The type of skeleton to display, passed to PageLoadingSkeleton.
 * @returns {JSX.Element} The loading skeleton UI.
 */
const SuspenseLoader = ({ type = "buying" }) => (
  <PageLoadingSkeleton type={type} />
);

/**
 * @component ProtectedRoute
 * @description A wrapper component that protects routes requiring user authentication.
 * If the user is not authenticated, it redirects them to the login page,
 * preserving the intended destination to redirect back after login.
 *
 * @param {object} props - The component's props.
 * @param {object} props.user - The authenticated user object. If null or undefined, access is denied.
 * @param {React.ReactNode} props.children - The child components to render if the user is authenticated.
 * @returns {JSX.Element} The child components or a Navigate component for redirection.
 */
function ProtectedRoute({ user, children }) {
  const location = useLocation(); // Get current location to redirect back after login
  if (!user) {
    // User not authenticated, redirect to login page
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  // User is authenticated, render the protected content
  return children;
}

/**
 * @component AppLayout
 * @description The main layout structure for the application.
 * It includes the header, footer, mobile navigation, and routing for different sections of the app.
 * Handles global search state and prefetching of components.
 *
 * @param {object} props - The component's props.
 * @param {object} props.user - The current authenticated user object.
 * @param {Function} props.handleLogout - Callback function to handle user logout.
 * @param {Function} props.showGlobalMessage - Callback function to display global messages (notifications/alerts).
 * @returns {JSX.Element} The main application layout.
 */
function AppLayout({ user, handleLogout, showGlobalMessage }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname.startsWith("/auth"); // Check if the current page is an authentication page

  // State for global search functionality
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null); // Placeholder for search results display
  const searchTimeoutRef = useRef(null); // Ref for debouncing search input

  /**
   * Navigates to the authentication page with a specified action (e.g., 'login' or 'signup').
   * @param {string} [action="login"] - The authentication action.
   * @type {Function}
   */
  const navigateToAuthWithAction = useCallback(
    (action = "login") => {
      navigate(`/auth/${action}`);
    },
    [navigate] // Dependency: navigate function from react-router-dom
  );

  /**
   * Handles global search input changes with debouncing.
   * Updates the global search term and potentially triggers a search.
   * @param {string} searchTerm - The current search term from the header.
   * @type {Function}
   */
  const handleGlobalSearch = useCallback((searchTerm) => {
    // Clear any existing timeout to reset debounce timer
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout to debounce the search action
    searchTimeoutRef.current = setTimeout(() => {
      setGlobalSearchTerm(searchTerm);

      // If search term is cleared, also clear results
      if (!searchTerm.trim()) {
        setSearchResults(null);
        return;
      }

      // Placeholder for actual search logic (e.g., API call)
      console.log("Debounced global search initiated for:", searchTerm);
      // Example: fetchSearchResults(searchTerm).then(setSearchResults);
    }, 300); // 300ms debounce period
  }, []); // No dependencies, as it relies on its own closure and ref

  // Effect to clean up the search debounce timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Effect to clear global search term and results when the route changes
  useEffect(() => {
    setGlobalSearchTerm("");
    setSearchResults(null);
  }, [location.pathname]); // Dependency: current pathname

  /**
   * Prefetches lazy-loaded components based on a component name.
   * This can be triggered by hover/focus on navigation links to improve perceived performance.
   * @param {string} componentName - The key identifying the component to prefetch.
   * @type {Function}
   */
  const prefetchComponent = useCallback((componentName) => {
    // Dynamically import components to start loading them
    switch (componentName) {
      case "buy":
        import("./pages/buying/BuyingSection.jsx");
        break;
      case "sell":
        import("./pages/selling/SellingSection.jsx");
        break;
      case "lostfound":
        import("./pages/lostfound/LostAndFoundSection.jsx");
        break;
      case "auth":
        import("./pages/auth/AuthComponent.jsx");
        break;
      // Add other components as needed
      default:
        break;
    }
  }, []);

  // Determine if the search bar in the header should be visible
  const shouldShowSearch = !isAuthPage; // Search is hidden on authentication pages

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      {/* Header: Displayed on all pages except authentication pages */}
      {!isAuthPage && (
        <Header
          user={user}
          onLogout={handleLogout}
          onNavigateToAuth={navigateToAuthWithAction}
          onSearchChange={handleGlobalSearch}
          searchValue={globalSearchTerm}
          showSearch={shouldShowSearch}
        />
      )}

      {/* Main Content Area: Routes are rendered here */}
      <main className={`flex-grow ${!isAuthPage ? "pb-20 md:pb-5" : ""}`}>
        {" "}
        {/* Adjust padding for footer/mobile nav */}
        <Suspense fallback={<SuspenseLoader type="buying" />}>
          {" "}
          {/* Fallback UI for lazy-loaded routes */}
          <Routes>
            {/* Default route: redirects to /buy */}
            <Route path="/" element={<Navigate to="/buy" replace />} />

            {/* Buying Section Route */}
            <Route
              path="/buy"
              element={
                <BuyingSection
                  user={user}
                  showMessage={showGlobalMessage}
                  globalSearchTerm={globalSearchTerm} // Pass global search term
                  onSearchTermChange={setGlobalSearchTerm} // Allow section to update global search
                />
              }
            />

            {/* Selling Section Route (Protected) */}
            <Route
              path="/sell"
              element={
                <ProtectedRoute user={user}>
                  {" "}
                  {/* Protect this route */}
                  <SellingSection
                    user={user}
                    showMessage={showGlobalMessage}
                    navigateToAuth={navigateToAuthWithAction}
                    globalSearchTerm={globalSearchTerm}
                    onSearchTermChange={setGlobalSearchTerm}
                  />
                </ProtectedRoute>
              }
            />

            {/* Lost & Found Section Route */}
            <Route
              path="/lostfound"
              element={
                <LostAndFoundSection
                  user={user}
                  showMessage={showGlobalMessage}
                  navigateToAuth={navigateToAuthWithAction}
                  globalSearchTerm={globalSearchTerm}
                  onSearchTermChange={setGlobalSearchTerm}
                />
              }
            />

            {/* Individual Item Page Route */}
            <Route
              path="/item/:itemId"
              element={
                <ItemPageComponent // Component to display details of a single item
                  user={user}
                  showMessage={showGlobalMessage}
                />
              }
            />

            {/* Authentication Routes (e.g., /auth/login, /auth/signup) */}
            <Route path="/auth/:action" element={<AuthComponent />} />
            {/* Base /auth route redirects to /auth/login */}
            <Route
              path="/auth"
              element={<Navigate to="/auth/login" replace />}
            />

            {/* Not Found Route (404) */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* Mobile Navigation: Displayed on non-auth pages. Includes prefetch triggers. */}
      {!isAuthPage && (
        <div
          onMouseEnter={() => prefetchComponent("sell")} // Example: Prefetch "sell" section on mouse enter
          onTouchStart={() => prefetchComponent("sell")} // Example: Prefetch for touch devices
          role="navigation"
          aria-label="Mobile bottom navigation"
        >
          <MobileNavigation
            user={user}
            onLogout={handleLogout}
            onNavigateToAuth={navigateToAuthWithAction}
          />
        </div>
      )}

      {/* Footer: Displayed on non-auth pages */}
      {!isAuthPage && <Footer user={user} />}

      {/* Global Search Results Overlay (Example Implementation) */}
      {searchResults && ( // Conditionally render if searchResults exist
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            {/* Overlay Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Search Results for "{globalSearchTerm}"
                </h3>
                <button
                  onClick={() => {
                    // Clear results and search term
                    setSearchResults(null);
                    setGlobalSearchTerm("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close search results"
                >
                  {/* Close Icon */}
                  <svg
                    className="w-6 h-6"
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
            {/* Overlay Content: Where search results would be rendered */}
            <div className="p-4">
              <div className="text-center py-8 text-gray-500">
                {/* Placeholder for actual search result rendering logic */}
                Global search results for "{globalSearchTerm}" would appear
                here.
                {/* Example: searchResults.map(item => <SearchResultItem key={item.id} item={item} />) */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppLayout;