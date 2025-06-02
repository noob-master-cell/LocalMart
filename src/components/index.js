// project/src/components/index.js
import AuthRedirector from "./Auth/AuthRedirector"; // Assuming default export from Auth/index.js or AuthRedirector.jsx

import { CompactFilterBar, SearchAndFilter } from "./Filters"; // Assuming named exports from Filters/index.js

import { ItemCard, ItemForm, ItemQuestions, ItemDetailModal } from "./Items"; // Assuming named exports from Items/index.js

import { Header, Footer } from "./Layout"; // Assuming named exports from Layout/index.js

import { ImageViewer } from "./Media"; // Assuming named export from Media/index.js

import { MobileNavigation, NavLinkRouter, NotFound } from "./Navigation"; // Assuming named exports from Navigation/index.js

import {
  MessageBar,
  Modal,
  EmptyState,
  ErrorBoundary,
  LoadingSpinner,
  LoadingSkeletons, // This is likely the default export (PageLoadingSkeleton) from UI/LoadingSkeletons
  SkeletonBase, // Example of a named skeleton export, add others if needed
  ItemCardSkeleton, // Example
  ProgressiveImage,
  // Add other specific named exports from UI/Modal if needed, e.g., ModalHeader
} from "./UI"; // Assuming various exports from UI/index.js

import VirtualList, { VirtualGrid, VirtualListItem } from "./VirtualList"; // Default and named from VirtualList/index.js

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
  LoadingSkeletons, // Default export (PageLoadingSkeleton)
  SkeletonBase,
  ItemCardSkeleton,
  ProgressiveImage,
  VirtualList, // Default export
  VirtualGrid,
  VirtualListItem,
};
