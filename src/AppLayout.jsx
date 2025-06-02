import React, {
  useState,
  useCallback,
  lazy,
  Suspense,
  useEffect,
  useMemo,
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
const ItemPageComponent = lazy(() =>
  import("./pages/itemPage/ItemPageComponent.jsx")
);
// Lazy load feature sections
const NotFound = lazy(() => import("./components/Navigation/NotFound"));
const AuthComponent = lazy(() => import("./pages/auth/AuthComponent"));
const BuyingSection = lazy(() => import("./pages/buying/BuyingSection"));
const SellingSection = lazy(() => import("./pages/selling/SellingSection"));
const LostAndFoundSection = lazy(() =>
  import("./pages/lostfound/LostAndFoundSection")
);

// Loading component for Suspense
const SuspenseLoader = ({ type = "buying" }) => (
  <PageLoadingSkeleton type={type} />
);

// Protected Route Component
function ProtectedRoute({ user, children }) {
  const location = useLocation();
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  return children;
}

function AppLayout({ user, handleLogout, showGlobalMessage }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname.startsWith("/auth");

  // Global search state
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const searchTimeoutRef = useRef(null);

  const navigateToAuthWithAction = useCallback(
    (action = "login") => {
      navigate(`/auth/${action}`);
    },
    [navigate]
  );

  // Handle global search from header (no longer needs debouncing here)
  const handleGlobalSearch = useCallback((searchTerm) => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search to reduce Firebase calls
    searchTimeoutRef.current = setTimeout(() => {
      setGlobalSearchTerm(searchTerm);

      // If search is cleared, reset results
      if (!searchTerm.trim()) {
        setSearchResults(null);
        return;
      }

      console.log("Global search:", searchTerm);
    }, 300); // 300ms debounce
  }, []); // Remove dependencies that cause re-creation
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  // Clear search when route changes
  useEffect(() => {
    setGlobalSearchTerm("");
    setSearchResults(null);
  }, [location.pathname]);

  // Prefetch components on hover/focus
  const prefetchComponent = useCallback((componentName) => {
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
    }
  }, []);

  // Determine if current page should show search
  const shouldShowSearch = !isAuthPage;

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      {/* Enhanced Header with Search */}
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

      {/* Main Content */}
      <main className={`flex-grow ${!isAuthPage ? "pb-20 md:pb-5" : ""}`}>
        <Suspense fallback={<SuspenseLoader type="buying" />}>
          <Routes>
            <Route path="/" element={<Navigate to="/buy" replace />} />
            <Route
              path="/buy"
              element={
                <BuyingSection
                  user={user}
                  showMessage={showGlobalMessage}
                  globalSearchTerm={globalSearchTerm}
                  onSearchTermChange={setGlobalSearchTerm}
                />
              }
            />
            <Route
              path="/sell"
              element={
                <ProtectedRoute user={user}>
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
            <Route
              path="/item/:itemId" // New route for individual items
              element={
                <ItemPageComponent
                  user={user}
                  showMessage={showGlobalMessage}
                />
              }
            />
            <Route path="/auth/:action" element={<AuthComponent />} />
            <Route
              path="/auth"
              element={<Navigate to="/auth/login" replace />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* Mobile Navigation with prefetch on hover */}
      {!isAuthPage && (
        <div
          onMouseEnter={() => prefetchComponent("sell")}
          onTouchStart={() => prefetchComponent("sell")}
        >
          <MobileNavigation
            user={user}
            onLogout={handleLogout}
            onNavigateToAuth={navigateToAuthWithAction}
          />
        </div>
      )}

      {/* Footer */}
      {!isAuthPage && <Footer user={user} />}

      {/* Global Search Results Overlay (if implemented) */}
      {searchResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Search Results for "{globalSearchTerm}"
                </h3>
                <button
                  onClick={() => {
                    setSearchResults(null);
                    setGlobalSearchTerm("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
            <div className="p-4">
              {/* Search results would be rendered here */}
              <div className="text-center py-8 text-gray-500">
                Global search results would appear here
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppLayout;
