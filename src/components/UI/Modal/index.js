// This file serves as the entry point for Modal related components.
// It exports the main Modal component as the default export and its sub-components (Header, Body, Footer)
// as named exports. This allows consumers to use the composed Modal component or,
// if needed, use the sub-components individually for more custom modal structures.

import Modal from "./Modal"; // The main Modal component that composes Header, Body, and Footer.

// Export sub-components for direct usage if more granular control over modal structure is needed.
export { default as ModalHeader } from "./ModalHeader"; // Component for the modal's header section.
export { default as ModalBody } from "./ModalBody"; // Component for the modal's main content area.
export { default as ModalFooter } from "./ModalFooter"; // Component for the modal's footer/actions area.

// Default export is the primary Modal component.
export default Modal;
