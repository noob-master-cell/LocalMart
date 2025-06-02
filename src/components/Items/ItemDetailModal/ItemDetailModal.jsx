import React, { useMemo, useCallback, useEffect, memo } from "react";
import UserCircleIcon from "../../Icons/UserCircleIcon"; // For generic contact fallback
import ShoppingBagIcon from "../../Icons/ShoppingBagIcon"; // For image placeholder
import WhatsAppIcon from "../../Icons/WhatsAppIcon"; // For WhatsApp contact button
import LinkIcon from "../../Icons/LinkIcon"; // For copy link button
import ProgressiveImage from "../../UI/ProgressiveImage"; // For optimized image loading
import {
  generateWhatsAppURL,
  formatPrice,
  formatRelativeTime,
} from "../../../utils/helpers"; // Utility functions
import ItemQuestions from "../ItemQuestions/ItemQuestions"; // Q&A component

/**
 * @component ItemDetailModal
 * @description A modal component that displays detailed information about an item.
 * It includes item images, description, price, contact options, and a Q&A section.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.item - The item object containing details to display.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {Function} props.onClose - Callback function to close the modal.
 * @param {Function} [props.onContact] - Callback for a generic contact action if WhatsApp is not available.
 * @param {boolean} [props.isLostAndFound=false] - Flag to adjust display for lost & found items.
 * @param {Function} [props.showMessage] - Callback to display user feedback messages.
 * @param {boolean} [props.hideContactButton=false] - Flag to hide the contact button.
 * @param {object} [props.user] - The currently authenticated user, passed to ItemQuestions.
 * @returns {JSX.Element|null} The ItemDetailModal component if `isOpen` and `item` are provided, otherwise null.
 */
const ItemDetailModal = memo(
  ({
    item,
    isOpen,
    onClose,
    onContact, // Generic contact fallback
    isLostAndFound = false,
    showMessage,
    hideContactButton = false,
    user, // Current user for Q&A context
  }) => {
    // Memoized calculation for poster's display name
    const posterName = useMemo(
      () => item?.userDisplayName || item?.userEmail || "Anonymous",
      [item?.userDisplayName, item?.userEmail] // Corrected dependencies
    );

    // Memoized calculation for formatted price
    const formattedPrice = useMemo(
      () =>
        !isLostAndFound && item?.price != null // Check item and price explicitly
          ? formatPrice // Ensure formatPrice function is available
            ? formatPrice(item.price)
            : `€${Number(item.price).toFixed(2)}` // Fallback formatting
          : null,
      [item?.price, isLostAndFound, formatPrice] // Corrected dependencies
    );

    // Memoized calculation for formatted creation time
    const formattedTime = useMemo(
      () => (item?.createdAt ? formatRelativeTime(item.createdAt) : null),
      [item?.createdAt, formatRelativeTime] // Corrected dependencies
    );

    // Memoized calculation for WhatsApp contact URL
    const whatsappUrl = useMemo(
      () =>
        item?.whatsappNumber && item?.name // Check item, whatsappNumber, and name
          ? generateWhatsAppURL(item.whatsappNumber, item.name)
          : null,
      [item?.whatsappNumber, item?.name, generateWhatsAppURL] // Corrected dependencies
    );

    /**
     * Handles the contact button click. Opens WhatsApp or calls onContact.
     * @type {Function}
     */
    const handleContactClick = useCallback(() => {
      if (whatsappUrl) {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      } else if (item?.whatsappNumber) {
        // If number exists but URL generation failed (e.g. invalid format)
        showMessage?.(
          "Invalid WhatsApp number format or not provided.",
          "error"
        );
      } else if (onContact) {
        // Fallback to generic contact
        onContact(item);
      }
    }, [whatsappUrl, item, onContact, showMessage]);

    /**
     * Copies the item's unique URL to the clipboard.
     * @type {Function}
     */
    const handleCopyLink = useCallback(async () => {
      if (!item || !item.id) {
        showMessage?.("Cannot copy link: Item ID is missing.", "error");
        return;
      }
      // Construct the item's unique URL. Adjust path if routing is different.
      const itemUrl = `${window.location.origin}/item/${item.id}`;
      try {
        await navigator.clipboard.writeText(itemUrl);
        showMessage?.("Link copied to clipboard!", "success", {
          duration: 3000, // Show message for 3 seconds
        });
      } catch (err) {
        console.error("Failed to copy item link: ", err);
        showMessage?.("Failed to copy link. Please try again.", "error");
      }
    }, [item, showMessage]);

    // Memoized calculation for the primary image URL (first image in the array)
    const primaryImageUrl = useMemo(
      () =>
        item?.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : null,
      [item?.imageUrls] // Corrected dependency
    );

    // Effect to manage body overflow (prevent background scrolling) when modal is open/closed
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = ""; // Reset to default
      }
      return () => {
        // Cleanup function
        document.body.style.overflow = "";
      };
    }, [isOpen]);

    // Do not render if modal is not open or item data is missing
    if (!isOpen || !item) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-0 sm:p-4 z-50 overflow-y-auto"
        onClick={onClose} // Close modal on backdrop click
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-detail-modal-title"
      >
        <div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[100vh] sm:max-h-[90vh] flex flex-col mx-auto my-0 sm:my-8"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
        >
          {/* Modal Header: Title and Close Button */}
          <div className="sticky top-0 flex justify-between items-center p-3 sm:p-4 border-b bg-white z-10 rounded-t-lg">
            <h2
              id="item-detail-modal-title"
              className="text-xl sm:text-2xl font-semibold text-gray-800 truncate pr-8" // pr-8 to avoid overlap with close button
              title={item.name || "Item Details"}
            >
              {item.name || "Item Details"}
            </h2>
            <button
              onClick={onClose}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <svg // Close (X) icon
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          {/* Modal Content: Scrollable area with item details */}
          <div className="overflow-y-auto flex-grow custom-scrollbar p-3 sm:p-6">
            {/* Primary Image Display or Placeholder */}
            {primaryImageUrl ? (
              <div className="mb-4 sm:mb-6 rounded-lg overflow-hidden shadow">
                <ProgressiveImage
                  src={primaryImageUrl}
                  alt={item.name || "Item Image"}
                  className="w-full h-48 sm:h-64 md:h-80 object-cover" // Responsive image height
                  itemName={item.name}
                />
              </div>
            ) : (
              // Placeholder if no image is available
              <div className="w-full h-48 sm:h-64 md:h-80 flex items-center justify-center bg-gray-100 rounded-lg mb-6 shadow">
                <ShoppingBagIcon className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400" />
              </div>
            )}

            {/* Formatted Price (if applicable) */}
            {formattedPrice && (
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-4">
                {formattedPrice}
              </p>
            )}

            {/* Item Description */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-1">
                Description
              </h4>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {" "}
                {/* `whitespace-pre-wrap` preserves line breaks */}
                {item.description || "No description available."}
              </p>
            </div>

            {/* Lost & Found Specific Details (if applicable) */}
            {isLostAndFound && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                <h4 className="text-md font-semibold text-blue-700 mb-1">
                  Lost & Found Details
                </h4>
                {item.lastSeenLocation && (
                  <p className="text-sm text-blue-600">
                    <span className="font-medium">Last seen:</span>{" "}
                    {item.lastSeenLocation}
                  </p>
                )}
                {item.dateFound?.seconds && ( // Check for Firestore Timestamp
                  <p className="text-sm text-blue-600">
                    <span className="font-medium">Date:</span>{" "}
                    {new Date( // Convert Timestamp to readable date
                      item.dateFound.seconds * 1000
                    ).toLocaleDateString()}
                  </p>
                )}
                {/* Message if no specific L&F details are provided */}
                {!item.lastSeenLocation && !item.dateFound?.seconds && (
                  <p className="text-sm text-blue-600">
                    No specific lost & found details provided.
                  </p>
                )}
              </div>
            )}

            {/* Grid for additional item details (Category, Poster, Time, Condition) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-6">
              <div>
                <span className="font-semibold text-gray-700">Category:</span>
                <span className="text-gray-600 ml-1">
                  {item.category || "N/A"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Posted by:</span>
                <span
                  className="text-gray-600 ml-1 truncate" // Truncate long names
                  title={posterName} // Show full name on hover
                >
                  {posterName}
                </span>
              </div>
              {formattedTime && (
                <div>
                  <span className="font-semibold text-gray-700">Posted:</span>
                  <span className="text-gray-600 ml-1">{formattedTime}</span>
                </div>
              )}
              {item.condition &&
                !isLostAndFound && ( // Show condition only for 'sell' items
                  <div>
                    <span className="font-semibold text-gray-700">
                      Condition:
                    </span>
                    <span className="text-gray-600 ml-1">{item.condition}</span>
                  </div>
                )}
            </div>

            {/* Item Questions & Answers Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <ItemQuestions
                item={item}
                user={user} // Pass current user for context
                showMessage={showMessage}
                isLostAndFound={isLostAndFound}
              />
            </div>
          </div>

          {/* Modal Footer: Action Buttons (Copy Link, Contact, Close) */}
          <div className="sticky bottom-0 p-3 sm:p-4 border-t flex flex-col sm:flex-row justify-end items-center gap-2 sm:space-x-3 bg-white rounded-b-lg">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full sm:w-auto order-first sm:order-none font-medium py-2.5 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              title="Copy link to this item"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Copy Link</span>
            </button>
            {/* Contact Button (conditionally rendered) */}
            {!hideContactButton && (
              <button
                type="button"
                onClick={handleContactClick}
                // Disable if no WhatsApp number and no generic onContact callback
                disabled={!item.whatsappNumber && !onContact}
                className={`w-full sm:w-auto font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  item.whatsappNumber // Style based on contact method availability
                    ? isLostAndFound // Different colors for L&F vs Sell
                      ? "bg-green-500 hover:bg-green-600 text-white focus:ring-green-500"
                      : "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500"
                    : onContact // Style for generic contact
                    ? "bg-purple-500 hover:bg-purple-600 text-white focus:ring-purple-500"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed" // Disabled style
                }`}
              >
                {item.whatsappNumber ? (
                  <WhatsAppIcon />
                ) : (
                  <UserCircleIcon className="w-5 h-5" /> // Fallback icon
                )}
                <span>
                  {" "}
                  {/* Dynamic button text */}
                  {item.whatsappNumber
                    ? isLostAndFound
                      ? "Contact Finder"
                      : "Contact Seller"
                    : "Contact Poster"}
                </span>
              </button>
            )}
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Close
            </button>
          </div>
          {/* Message if no contact method is available (and contact button is not hidden) */}
          {!hideContactButton && !item.whatsappNumber && !onContact && (
            <p className="text-xs text-red-500 px-4 pb-3 text-center sm:text-right">
              No contact method provided by poster.
            </p>
          )}
        </div>
      </div>
    );
  }
);
ItemDetailModal.displayName = "ItemDetailModal"; // For better debugging
export default ItemDetailModal;
