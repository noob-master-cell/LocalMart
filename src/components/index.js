// This file serves as a central export point for all components in the 'components' directory.
// It allows for cleaner and more organized imports in other parts of the application.
// For example, instead of `import Header from './components/Layout/Header'`,
// you can use `import { Header } from './components'`.

// --- Auth Components ---
// AuthRedirector: Component to guide users to login/signup if required.
import AuthRedirector from "./Auth/AuthRedirector";

// --- Filter Components ---
// CompactFilterBar: A space-saving filter UI, often for mobile or secondary filtering.
// SearchAndFilter: A more comprehensive search and filter component, possibly with a sidebar.
import { CompactFilterBar, SearchAndFilter } from "./Filters";

// --- Item Display and Form Components ---
// ItemCard: Displays a summary of an item in a card format.
// ItemForm: Form for creating or editing items.
// ItemQuestions: Component for displaying and managing Q&A related to an item.
// ItemDetailModal: Modal to show detailed information about an item.
import { ItemCard, ItemForm, ItemQuestions, ItemDetailModal } from "./Items";

// --- Layout Components ---
// Header: The main application header/navigation bar.
// Footer: The application footer.
import { Header, Footer } from "./Layout";

// --- Media Components ---
// ImageViewer: Component for viewing images, possibly with zoom/carousel features.
import { ImageViewer } from "./Media";

// --- Navigation Components ---
// MobileNavigation: Navigation bar specifically designed for mobile views.
// NavLinkRouter: A custom NavLink component integrated with React Router.
// NotFound: Component displayed for 404 Not Found routes.
import { MobileNavigation, NavLinkRouter, NotFound } from "./Navigation";

// --- UI Utility Components ---
// MessageBar: Displays global messages/notifications (success, error, info).
// Modal: A general-purpose modal/dialog component. (Note: there's a more specific Modal in UI/Modal)
// EmptyState: Component to display when there's no content (e.g., no search results).
// ErrorBoundary: Catches JavaScript errors in its child component tree and displays a fallback UI.
// LoadingSpinner: A simple spinner for indicating loading states.
// LoadingSkeletons: Placeholder UIs (skeletons) to show while content is loading.
// SkeletonBase, ItemCardSkeleton: Specific skeleton components.
// ProgressiveImage: Image component that loads a placeholder first, then the actual image.
import {
  MessageBar,
  Modal, // This might refer to the older Modal or the re-export from UI/Modal
  EmptyState,
  ErrorBoundary,
  LoadingSpinner,
  LoadingSkeletons, // Likely the default export (PageLoadingSkeleton)
  SkeletonBase,
  ItemCardSkeleton,
  ProgressiveImage,
} from "./UI";

// --- Virtual List Components ---
// VirtualList, VirtualGrid, VirtualListItem: Components for efficiently rendering large lists/grids.
import VirtualList, { VirtualGrid, VirtualListItem } from "./VirtualList";

// Export all imported components for use elsewhere in the application.
export {
  AuthRedirector,
  CompactFilterBar,
  SearchAndFilter,
  ItemCard,
  ItemForm,
  ItemQuestions,
  ItemDetailModal,
  Header,
  Footer,
  ImageViewer,
  MobileNavigation,
  NavLinkRouter,
  NotFound,
  MessageBar,
  Modal,
  EmptyState,
  ErrorBoundary,
  LoadingSpinner,
  LoadingSkeletons,
  SkeletonBase,
  ItemCardSkeleton,
  ProgressiveImage,
  VirtualList,
  VirtualGrid,
  VirtualListItem,
};
