import React, { useState, useCallback, useMemo, memo } from "react";
import ItemCardHeader from "./ItemCardHeader.jsx";
import ItemCardDetails from "./ItemCardDetails.jsx";
import ImageViewer from "../../Media/ImageViewer/ImageViewer.jsx"; // For full-screen image viewing
import ItemDetailModal from "../ItemDetailModal/ItemDetailModal.jsx"; // For detailed item view
import {
  generateWhatsAppURL,
  formatPrice,
  formatRelativeTime,
} from "../../../utils/helpers.js"; // Utility functions

/**
 * @component ItemCard
 * @description Displays a single item in a card format, showing a summary of its details.
 * It includes image navigation, and options to view more details or contact the poster.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.item - The item object to display.
 * @param {Function} [props.onContact] - Callback function for initiating contact (e.g., if WhatsApp is not available).
 * @param {boolean} [props.isLostAndFound=false] - Flag to adjust display for lost & found items.
 * @param {Function} [props.showMessage] - Callback to display user feedback messages.
 * @param {string} [props.className=""] - Additional CSS classes for the card container.
 * @param {boolean} [props.hideContactButton=false] - Flag to hide the contact button.
 * @param {object} [props.user] - The currently authenticated user (passed to ItemDetailModal).
 * @param {string} [props.statusIndicator] - Indicates item status ('lost', 'found') for visual cues.
 * @param {React.ReactNode} [props.actionElements] - Custom action elements to replace default buttons.
 * @returns {JSX.Element} The item card component.
 */
const ItemCard = memo(
  ({
    item,
    onContact, // Generic contact callback
    isLostAndFound = false,
    showMessage, // For displaying messages like errors or info
    className = "", // Custom styling for the card
    hideContactButton = false,
    user, // Current user, passed to detail modal
    statusIndicator, // 'lost', 'found', or null for visual border
    actionElements, // For custom buttons in the card footer
  }) => {
    // State for managing the current image index in the card's mini-carousel
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // State for controlling the visibility of the full-screen image viewer
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    // State for controlling the visibility of the item detail modal
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Memoized array of image URLs for the item
    const images = useMemo(
      () => (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : []),
      [item.imageUrls]
    );

    // Memoized display name of the item's poster
    const posterName = useMemo(
      () => item.userDisplayName || item.userEmail || "Anonymous",
      [item.userDisplayName, item.userEmail]
    );

    // Memoized formatted price (null if lost & found or no price)
    const formattedPrice = useMemo(
      () =>
        !isLostAndFound && item.price != null ? formatPrice(item.price) : null,
      [item.price, isLostAndFound, formatPrice]
    );

    // Memoized formatted time since the item was created/posted
    const formattedTime = useMemo(
      () => (item.createdAt ? formatRelativeTime(item.createdAt) : null),
      [item.createdAt, formatRelativeTime]
    );

    // Memoized WhatsApp contact URL
    const whatsappUrl = useMemo(
      () =>
        item.whatsappNumber && item.name // Ensure number and item name are present
          ? generateWhatsAppURL(item.whatsappNumber, item.name)
          : null,
      [item.whatsappNumber, item.name, generateWhatsAppURL]
    );

    /**
     * Navigates to the next image in the card's image carousel.
     * @param {React.MouseEvent} e - The click event.
     */
    const nextImage = useCallback(
      (e) => {
        e.stopPropagation(); // Prevent card click or other underlying actions
        if (images.length > 0) { // Ensure images exist
          setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }
      },
      [images.length] // Dependency: images array length
    );

    /**
     * Navigates to the previous image in the card's image carousel.
     * @param {React.MouseEvent} e - The click event.
     */
    const prevImage = useCallback(
      (e) => {
        e.stopPropagation(); // Prevent card click
        if (images.length > 0) { // Ensure images exist
          setCurrentImageIndex(
            (prevIndex) => (prevIndex - 1 + images.length) % images.length
          );
        }
      },
      [images.length] // Dependency: images array length
    );

    /**
     * Opens the full-screen image viewer.
     * @param {React.MouseEvent} e - The click event.
     */
    const openImageViewer = useCallback(
      (e) => {
        e.stopPropagation(); // Prevent card click
        if (images.length > 0) { // Only open if there are images
          setIsImageViewerOpen(true);
        }
      },
      [images.length] // Dependency: images array length
    );
    /** Closes the full-screen image viewer. */
    const closeImageViewer = useCallback(() => setIsImageViewerOpen(false), []);

    /** Opens the item detail modal. */
    const openDetailModal = useCallback(() => setIsDetailModalOpen(true), []);
    /** Closes the item detail modal. */
    const closeDetailModal = useCallback(() => setIsDetailModalOpen(false), []);

    /**
     * Handles the contact action, either opening WhatsApp or calling the onContact prop.
     */
    const handleContactClick = useCallback(() => {
      if (whatsappUrl) {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      } else if (item.whatsappNumber && showMessage) { // Number exists but URL failed (e.g. invalid format)
        showMessage("Invalid WhatsApp number format.", "error");
      } else if (onContact) { // Fallback to generic contact handler
        onContact(item);
      } else if (showMessage) { // No contact method available
        showMessage("No contact method provided by poster.", "info");
      }
    }, [whatsappUrl, item, onContact, showMessage]);

    // Determine the CSS class for the status indicator border (e.g., for 'lost' or 'found' items)
    const statusIndicatorClass =
      statusIndicator === "lost"
        ? "border-l-4 border-red-400" // Red border for 'lost' items
        : statusIndicator === "found"
        ? "border-l-4 border-green-400" // Green border for 'found' items
        : ""; // No border if no status indicator

    return (
      <>
        {/* Main card container */}
        <div
          className={`bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300 flex flex-col h-full ${statusIndicatorClass} ${className}`}
          role="article"
          aria-labelledby={`item-card-title-${item.id}`}
        >
          {/* Card Header: Contains images and navigation */}
          <ItemCardHeader
            images={images}
            currentImageIndex={currentImageIndex}
            openImageViewer={openImageViewer}
            onPrevImage={prevImage}
            onNextImage={nextImage}
            onSetCurrentImageIndex={setCurrentImageIndex} // Allow direct setting of image index
            itemName={item.name}
          />
          {/* Card Details: Contains text info and action buttons */}
          <ItemCardDetails
            item={item}
            isLostAndFound={isLostAndFound}
            formattedPrice={formattedPrice}
            formattedTime={formattedTime}
            posterName={posterName}
            hideContactButton={hideContactButton}
            onContactClick={handleContactClick}
            onOpenDetailModal={openDetailModal} // Pass handler to open detail modal
            actionElements={actionElements} // Pass custom action elements if provided
          />
          {/* Hidden title for accessibility, referenced by aria-labelledby */}
          <h2 id={`item-card-title-${item.id}`} className="sr-only">{item.name || "Item"}</h2>
        </div>

        {/* Full-screen Image Viewer Modal (conditionally rendered) */}
        {isImageViewerOpen && (
          <ImageViewer
            images={images}
            initialIndex={currentImageIndex}
            isOpen={isImageViewerOpen}
            onClose={closeImageViewer}
            itemName={item.name || "Item"} // Pass item name for viewer title
          />
        )}

        {/* Item Detail Modal (conditionally rendered) */}
        {isDetailModalOpen && (
          <ItemDetailModal
            item={item}
            isOpen={isDetailModalOpen}
            onClose={closeDetailModal}
            onContact={onContact} // Pass generic contact handler
            isLostAndFound={isLostAndFound}
            showMessage={showMessage}
            hideContactButton={hideContactButton}
            user={user} // Pass current user context
          />
        )}
      </>
    );
  }
);
ItemCard.displayName = "ItemCard"; // For better debugging
export default ItemCard;