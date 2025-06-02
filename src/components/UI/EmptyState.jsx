// project/src/components/UI/EmptyState.jsx
import React from "react";
import SearchIcon from "../Icons/SearchIcon";
import ShoppingBagIcon from "../Icons/ShoppingBagIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";

/**
 * @constant iconMap
 * @description A mapping of icon keys to their corresponding React components.
 * Used to dynamically render an icon in the EmptyState component.
 * @type {Object.<string, React.ComponentType<any>>}
 */
const iconMap = {
  search: SearchIcon,
  shopping: ShoppingBagIcon,
  user: UserCircleIcon,
};

/**
 * @component EmptyState
 * @description Renders a placeholder UI to indicate that no content is available.
 * It can display an icon, a title, a description, and an optional action button.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} [props.icon="search"] - The key for the icon to display (from `iconMap`). Defaults to "search".
 * @param {string} [props.title="No items found"] - The main title message.
 * @param {string} [props.description="Try adjusting your search criteria or check back later."] - A more detailed description or instruction.
 * @param {React.ReactNode} [props.actionButton=null] - An optional React node (e.g., a button) for a call to action.
 * @param {string} [props.className=""] - Additional CSS classes for the main container.
 * @returns {JSX.Element} The EmptyState component.
 */
const EmptyState = ({
  icon = "search", // Default icon key
  title = "No items found", // Default title
  description = "Try adjusting your search criteria or check back later.", // Default description
  actionButton = null, // Optional action button (e.g., a Link or button component)
  className = "", // Additional custom styling
}) => {
  // Select the IconComponent based on the icon prop, defaulting to SearchIcon if not found.
  const IconComponent = iconMap[icon] || SearchIcon;

  return (
    <div className={`text-center py-16 px-4 ${className}`}>
      {/* Render the selected icon */}
      <IconComponent className="w-16 h-16 mx-auto text-gray-400 mb-4" aria-hidden="true" />
      {/* Title of the empty state message */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      {/* Description or instruction */}
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {/* Conditionally render the action button if provided */}
      {actionButton && (
        <div className="flex justify-center">{actionButton}</div>
      )}
    </div>
  );
};

export default EmptyState;
// The named export was commented out in the original; kept as is.
// export { EmptyState };