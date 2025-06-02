// This component represents a single item within a virtualized list or grid.
// It is responsible for rendering the content of an individual item and applying necessary styles for positioning.
import React from "react";

/**
 * VirtualListItem component.
 *
 * @param {object} props - The component's props.
 * @param {any} props.item - The data for the item to be rendered.
 * @param {object} props.style - CSS styles applied by the virtual list for positioning (e.g., absolute positioning, top offset).
 * @param {React.ReactNode} [props.children] - Optional children to render as the item's content.
 * If not provided, a default rendering based on `props.item` is used.
 * @returns {JSX.Element} The rendered list item.
 */
const VirtualListItem = ({ item, style, children }) => {
  // The `style` prop is crucial as it's injected by the parent virtual list (e.g., react-window or a custom implementation)
  // to position the item correctly within the scrollable container.
  return (
    <div style={style}>
      {children ? (
        // If children are provided, render them directly. This allows for custom item rendering.
        children
      ) : (
        // Default rendering logic if no children are passed.
        // This provides a basic way to display the item's content.
        <div className="p-2 border-b border-gray-200">
          {typeof item === "object" && item !== null
            ? // If the item is an object, try to display common properties like name, title, or id.
              // Fallback to JSON stringification if these properties are not found.
              item.name || item.title || item.id || JSON.stringify(item)
            : // If the item is not an object (e.g., string, number), convert it to a string.
              String(item)}
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders if props haven't changed.
// This is particularly important for performance in virtualized lists.
export default React.memo(VirtualListItem);