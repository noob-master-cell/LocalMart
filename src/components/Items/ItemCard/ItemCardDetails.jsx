import React from "react";
import WhatsAppIcon from "../../Icons/WhatsAppIcon"; // Icon for WhatsApp button

// Removed fixed height constant: const CARD_CONTENT_HEIGHT = "h-[220px]";

/**
 * @component ItemCardDetails
 * @description Renders the textual details and action buttons within an ItemCard.
 * This includes item name, description, price (if applicable), metadata, and contact/view details buttons.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.item - The item object containing details like name, description, price, etc.
 * @param {boolean} props.isLostAndFound - Flag to adjust display for lost & found items.
 * @param {string|null} props.formattedPrice - The pre-formatted price string (e.g., "$10.00").
 * @param {string|null} props.formattedTime - The pre-formatted relative time string (e.g., "2 hours ago").
 * @param {string} props.posterName - The display name of the item's poster.
 * @param {boolean} props.hideContactButton - Flag to hide the contact button.
 * @param {Function} props.onContactClick - Callback function for the contact button.
 * @param {Function} props.onOpenDetailModal - Callback function for the "View Details" button.
 * @param {React.ReactNode} [props.actionElements] - Optional custom action elements to replace default buttons.
 * @returns {JSX.Element} The details section of an item card.
 */
const ItemCardDetails = ({
  item,
  isLostAndFound,
  formattedPrice,
  formattedTime,
  posterName,
  hideContactButton,
  onContactClick,
  onOpenDetailModal,
  actionElements, // New prop for custom action buttons/elements in the footer
}) => {
  return (
    <div
      // Removed CARD_CONTENT_HEIGHT and outer overflow-hidden.
      // flex-grow allows this section to fill available vertical space within ItemCard.
      // flex-col ensures children are stacked vertically.
      className={`p-4 flex-grow flex flex-col`}
    >
      {/* Flex-grow container for main textual content. */}
      {/* overflow-hidden might still be useful here if individual text sections are very long
          and you want to ensure the buttons below are always reachable,
          but line-clamp should handle most cases. */}
      <div className="flex-grow">
        {/* Item Name: Displayed as a prominent heading. Line-clamp limits to 2 lines with ellipsis. */}
        <h3
          className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2"
          title={item.name} // Full name shown on hover for truncated names.
        >
          {item.name || "Untitled Item"}{" "}
          {/* Fallback if name is not provided. */}
        </h3>
        {/* Item Description: Limited to 3 lines with ellipsis. */}
        <p className="text-gray-600 mb-3 text-sm leading-relaxed line-clamp-3">
          {item.description || "No description available."}{" "}
          {/* Fallback for description. */}
        </p>

        {/* Price Display (only if formattedPrice is available) */}
        {formattedPrice && (
          <p className="text-xl font-bold text-indigo-600 mb-2">
            {formattedPrice}
          </p>
        )}

        {/* Lost & Found Specific Information (if applicable) */}
        {isLostAndFound && (
          <div className="mb-2 space-y-1">
            {item.lastSeenLocation && (
              <p className="text-sm text-gray-500">
                <span className="font-medium">Last seen:</span>{" "}
                {item.lastSeenLocation}
              </p>
            )}
            {item.dateFound?.seconds && ( // Check if dateFound is a Firestore Timestamp
              <p className="text-sm text-gray-500">
                <span className="font-medium">Date:</span>{" "}
                {new Date(item.dateFound.seconds * 1000).toLocaleDateString()}{" "}
                {/* Format timestamp to local date string. */}
              </p>
            )}
          </div>
        )}

        {/* Metadata Section: Category, Poster, Post Time */}
        <div className="space-y-1 mb-4">
          <p className="text-xs text-gray-400">
            <span className="font-medium">Category:</span>{" "}
            {item.category || "N/A"} {/* Fallback for category. */}
          </p>
          <p className="text-xs text-gray-400 truncate" title={posterName}>
            {" "}
            {/* Truncate long poster names. */}
            <span className="font-medium">By:</span> {posterName}
          </p>
          {formattedTime && ( // Display formatted post time if available.
            <p className="text-xs text-gray-400">
              <span className="font-medium">Posted:</span> {formattedTime}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons Area: Pushes to the bottom of the card content area. */}
      <div className="mt-auto pt-2">
        {" "}
        {/* `mt-auto` pushes this div to the bottom. `pt-2` for spacing. */}
        {actionElements ? ( // If custom actionElements are provided, render them.
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            {actionElements}
          </div>
        ) : (
          // Default action buttons: Contact and View Details.
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            {/* Contact Button (conditionally rendered) */}
            {!hideContactButton && (
              <button
                onClick={onContactClick}
                disabled={!item.whatsappNumber} // Disable if no WhatsApp number is provided.
                className={`flex-1 font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  item.whatsappNumber // Dynamic styling based on WhatsApp availability and item type.
                    ? isLostAndFound
                      ? "bg-green-500 hover:bg-green-600 text-white focus:ring-green-500" // Green for L&F contact.
                      : "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500" // Blue for seller contact.
                    : "bg-gray-300 text-gray-500 cursor-not-allowed" // Disabled style.
                }`}
                aria-label={
                  isLostAndFound ? "Contact finder" : "Contact seller"
                }
              >
                <WhatsAppIcon /> {/* WhatsApp icon. */}
                <span>{isLostAndFound ? "Contact" : "Contact Seller"}</span>
              </button>
            )}
            {/* View Details Button */}
            <button
              onClick={onOpenDetailModal}
              className={`flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                hideContactButton ? "w-full" : "" // Take full width if contact button is hidden.
              }`}
              aria-label={`View details for ${item.name || "this item"}`}
            >
              {/* View icon (eye) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true" // Icon is decorative
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z"
                />
              </svg>
              <span>View Details</span>
            </button>
          </div>
        )}
        {/* Message if contact button is not hidden, but no WhatsApp number is available and no custom actions. */}
        {!actionElements && !hideContactButton && !item.whatsappNumber && (
          <p className="text-xs text-red-500 mt-2 text-center">
            WhatsApp contact required by poster
          </p>
        )}
      </div>
    </div>
  );
};
export default React.memo(ItemCardDetails);