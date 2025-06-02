// project/src/components/VirtualList/VirtualList/VirtualListItem.jsx
import React from "react";

const VirtualListItem = ({ item, style, children }) => {
  // The 'style' prop is crucial for absolute positioning by the virtual list.
  // 'children' allows consumers to pass their own rendering for the item's content,
  // or they can rely on a default rendering based on 'item' if defined here.
  return (
    <div style={style}>
      {children ? (
        children
      ) : (
        // Default rendering if no children provided
        <div className="p-2 border-b border-gray-200">
          {typeof item === "object" && item !== null
            ? // Attempt to display common properties if item is an object
              item.name || item.title || item.id || JSON.stringify(item)
            : String(
                item
              ) // Fallback to string conversion
          }
        </div>
      )}
    </div>
  );
};

export default React.memo(VirtualListItem);
