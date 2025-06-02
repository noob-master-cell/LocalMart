// This file serves as a barrel export for UI utility components.
// It makes importing these components more convenient from other parts of the application.
// For example: `import { Modal, MessageBar } from './components/UI';`

// Exports the MessageBar component, used for displaying global notifications.
export { default as MessageBar } from "./MessageBar";

// Exports all named exports from the Modal directory (Modal, ModalHeader, etc.),
// and the default export (Modal component itself).
export * from "./Modal"; // This exports ModalHeader, ModalBody, ModalFooter if they are named exports in Modal/index.js
export { default as Modal } from "./Modal"; // Explicitly exports the default Modal component.

// Exports the EmptyState component, used when there's no data to display.
export { default as EmptyState } from "./EmptyState";

// Exports the ErrorBoundary component, for catching and handling React errors.
export { default as ErrorBoundary } from "./ErrorBoundary";

// Exports the LoadingSpinner component, a simple visual loading indicator.
export { default as LoadingSpinner } from "./LoadingSpinner";

// Exports LoadingSkeletons (likely a default export of PageLoadingSkeleton)
// and potentially other specific skeleton components if they were named exports.
export { default as LoadingSkeletons } from "./LoadingSkeletons";
// Example of exporting specific skeletons if needed:
// export { ItemCardSkeleton } from './LoadingSkeletons';
