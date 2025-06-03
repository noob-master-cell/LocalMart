import React, { useMemo, useCallback, useEffect, memo } from "react";
import UserCircleIcon from "../../Icons/UserCircleIcon";
import ShoppingBagIcon from "../../Icons/ShoppingBagIcon";
import WhatsAppIcon from "../../Icons/WhatsAppIcon";
import LinkIcon from "../../Icons/LinkIcon";
import ProgressiveImage from "../../UI/ProgressiveImage";
import {
  generateWhatsAppURL,
  formatPrice,
  formatRelativeTime,
} from "../../../utils/helpers";
import ItemQuestions from "../ItemQuestions/ItemQuestions";

const ItemDetailModal = memo(
  ({
    item,
    isOpen,
    onClose,
    onContact,
    isLostAndFound = false,
    showMessage,
    hideContactButton = false,
    user,
  }) => {
    const posterName = useMemo(
      () => item?.userDisplayName || item?.userEmail || "Anonymous",
      [item?.userDisplayName, item?.userEmail]
    );

    const formattedPrice = useMemo(
      () =>
        !isLostAndFound && item?.price != null
          ? formatPrice
            ? formatPrice(item.price)
            : `€${Number(item.price).toFixed(2)}`
          : null,
      [item?.price, isLostAndFound, formatPrice]
    );

    const formattedTime = useMemo(
      () => (item?.createdAt ? formatRelativeTime(item.createdAt) : null),
      [item?.createdAt, formatRelativeTime]
    );

    const whatsappUrl = useMemo(
      () =>
        item?.whatsappNumber && item?.name
          ? generateWhatsAppURL(item.whatsappNumber, item.name)
          : null,
      [item?.whatsappNumber, item?.name, generateWhatsAppURL]
    );

    const handleContactClick = useCallback(() => {
      if (whatsappUrl) {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      } else if (item?.whatsappNumber) {
        showMessage?.(
          "Invalid WhatsApp number format or not provided.",
          "error"
        );
      } else if (onContact) {
        onContact(item);
      }
    }, [whatsappUrl, item, onContact, showMessage]);

    const handleCopyLink = useCallback(async () => {
      if (!item || !item.id) {
        showMessage?.("Cannot copy link: Item ID is missing.", "error");
        return;
      }
      const itemUrl = `${window.location.origin}/item/${item.id}`;
      try {
        await navigator.clipboard.writeText(itemUrl);
        showMessage?.("Link copied to clipboard!", "success", {
          duration: 3000,
        });
      } catch (err) {
        console.error("Failed to copy item link: ", err);
        showMessage?.("Failed to copy link. Please try again.", "error");
      }
    }, [item, showMessage]);

    const primaryImageUrl = useMemo(
      () =>
        item?.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : null,
      [item?.imageUrls]
    );

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [isOpen]);

    if (!isOpen || !item) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-0 z-50" // Removed sm:p-4 to allow full screen on mobile
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-detail-modal-title"
      >
        <div
          // Ensure modal itself takes full height on mobile and handles its own overflow for header/footer stickiness.
          className="relative bg-white rounded-none sm:rounded-lg shadow-xl w-full h-full sm:max-h-[90vh] sm:max-w-4xl flex flex-col mx-auto my-0 sm:my-8 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header: Title and Close Button */}
          <div className="sticky top-0 flex justify-between items-center p-3 sm:p-4 border-b bg-white z-10 flex-shrink-0">
            <h2
              id="item-detail-modal-title"
              className="text-xl sm:text-2xl font-semibold text-gray-800 truncate pr-8"
              title={item.name || "Item Details"}
            >
              {item.name || "Item Details"}
            </h2>
            <button
              onClick={onClose}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <svg
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
            {primaryImageUrl ? (
              <div className="mb-4 sm:mb-6 rounded-lg overflow-hidden shadow">
                <ProgressiveImage
                  src={primaryImageUrl}
                  alt={item.name || "Item Image"}
                  className="w-full h-48 sm:h-64 md:h-80 object-cover"
                  itemName={item.name}
                />
              </div>
            ) : (
              <div className="w-full h-48 sm:h-64 md:h-80 flex items-center justify-center bg-gray-100 rounded-lg mb-6 shadow">
                <ShoppingBagIcon className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400" />
              </div>
            )}

            {formattedPrice && (
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-4">
                {formattedPrice}
              </p>
            )}

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-1">
                Description
              </h4>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {item.description || "No description available."}
              </p>
            </div>

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
                {item.dateFound?.seconds && (
                  <p className="text-sm text-blue-600">
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(
                      item.dateFound.seconds * 1000
                    ).toLocaleDateString()}
                  </p>
                )}
                {!item.lastSeenLocation && !item.dateFound?.seconds && (
                  <p className="text-sm text-blue-600">
                    No specific lost & found details provided.
                  </p>
                )}
              </div>
            )}

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
                  className="text-gray-600 ml-1 truncate"
                  title={posterName}
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
              {item.condition && !isLostAndFound && (
                <div>
                  <span className="font-semibold text-gray-700">
                    Condition:
                  </span>
                  <span className="text-gray-600 ml-1">{item.condition}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <ItemQuestions
                item={item}
                user={user}
                showMessage={showMessage}
                isLostAndFound={isLostAndFound}
              />
            </div>
          </div>

          {/* Modal Footer: Action Buttons */}
          {/* Added sticky bottom-0 back for consistent footer positioning within the modal's flex container */}
          <div className="sticky bottom-0 p-3 sm:p-4 border-t flex flex-col sm:flex-row justify-end items-center gap-2 sm:space-x-3 bg-white rounded-b-lg flex-shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full sm:w-auto order-first sm:order-none font-medium py-2.5 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              title="Copy link to this item"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Copy Link</span>
            </button>
            {!hideContactButton && (
              <button
                type="button"
                onClick={handleContactClick}
                disabled={!item.whatsappNumber && !onContact}
                className={`w-full sm:w-auto font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  item.whatsappNumber
                    ? isLostAndFound
                      ? "bg-green-500 hover:bg-green-600 text-white focus:ring-green-500"
                      : "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500"
                    : onContact
                    ? "bg-purple-500 hover:bg-purple-600 text-white focus:ring-purple-500"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {item.whatsappNumber ? (
                  <WhatsAppIcon />
                ) : (
                  <UserCircleIcon className="w-5 h-5" />
                )}
                <span>
                  {item.whatsappNumber
                    ? isLostAndFound
                      ? "Contact Finder"
                      : "Contact Seller"
                    : "Contact Poster"}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Close
            </button>
          </div>
          {!hideContactButton && !item.whatsappNumber && !onContact && (
            <p className="text-xs text-red-500 px-4 pb-3 text-center sm:text-right bg-white rounded-b-lg">
              {" "}
              {/* Ensure background for this message if footer is separate */}
              No contact method provided by poster.
            </p>
          )}
        </div>
      </div>
    );
  }
);
ItemDetailModal.displayName = "ItemDetailModal";
export default ItemDetailModal;