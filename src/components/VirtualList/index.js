// This file serves as the entry point for VirtualList related components.
// It exports the main VirtualList component as default and other related components like VirtualGrid and VirtualListItem as named exports.
// This structure allows for flexible importing depending on the needs of other modules.

// Import the VirtualList (default export) and VirtualGrid (named export) from the VirtualList component file.
import VirtualList, {
  VirtualGrid, // A component for rendering items in a grid layout with virtualization.
  VirtualListItem, // A component representing a single item within a virtualized list or grid.
} from "./VirtualList/VirtualList";

// Re-export VirtualList as the default export of this module.
// Also re-export VirtualGrid and VirtualListItem as named exports.
export { VirtualList as default, VirtualGrid, VirtualListItem };
