import React, { useMemo } from "react";
import ProgressiveImage from "../../UI/ProgressiveImage"; // For optimized image loading
import ChevronLeftIcon from "../../Icons/ChevronLeftIcon"; // Icon for previous image
import ChevronRightIcon from "../../Icons/ChevronRightIcon"; // Icon for next image
import ShoppingBagIcon from "../../Icons/ShoppingBagIcon"; // Placeholder icon for no image

// Define a fixed height for the card image area.
const CARD_IMAGE_HEIGHT = "h-48"; // Tailwind class for height (e.g., 12rem or 192px)

/**
 * @component ItemCardHeader
 * @description Renders the header section of an ItemCard, primarily displaying the item's images
 * with navigation controls (if multiple images exist) and an option to open an image viewer.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string[]} props.images - An array of image source URLs for the item.
 * @param {number} props.currentImageIndex - The index of the currently displayed image.
 * @param {Function} props.openImageViewer - Callback function to open a full-screen image viewer.
 * @param {Function} props.onPrevImage - Callback function to navigate to the previous image.
 * @param {Function} props.onNextImage - Callback function to navigate to the next image.
 * @param {Function} props.onSetCurrentImageIndex - Callback function to set the current image by its index (e.g., via dot indicators).
 * @param {string} [props.itemName="Item Image"] - The name of the item, used for alt text.
 * @returns {JSX.Element} The header section of an item card with image display and controls.
 */
const ItemCardHeader = ({
  images,
  currentImageIndex,
  openImageViewer,
  onPrevImage, // Renamed from prevImage in original to match onNextImage convention
  onNextImage, // Renamed from nextImage in original
  onSetCurrentImageIndex, // Renamed from setCurrentImageIndex for clarity if passed from parent
  itemName = "Item Image", // Default alt text prefix
}) => {
  const hasMultipleImages = images.length > 1; // Check if there's more than one image

  // Memoize the current image URL to avoid re-computation on every render
  const currentImageUrl = useMemo(
    () => images[currentImageIndex] || null, // Fallback to null if index is out of bounds or images is empty
    [images, currentImageIndex]
  );

  return (
    <div
      // Relative positioning for absolute child elements (navigation, image count)
      // CARD_IMAGE_HEIGHT sets the fixed height. Overflow-hidden clips content.
      // `group` class enables group-hover states for child elements.
      className={`relative w-full ${CARD_IMAGE_HEIGHT} bg-gray-200 overflow-hidden group`}
    >
      {currentImageUrl ? ( // If there's a current image URL to display
        <>
          <ProgressiveImage
            src={currentImageUrl}
            alt={`${itemName} ${
              // Descriptive alt text
              hasMultipleImages
                ? `(${currentImageIndex + 1}/${images.length})` // Indicate image number if multiple
                : ""
            }`}
            className="w-full h-full object-cover transition-all duration-300 cursor-pointer hover:scale-105" // Style for image display
            onClick={openImageViewer} // Open viewer on image click
            itemName={itemName} // Pass item name for placeholder generation in ProgressiveImage
          />
          {/* Overlay effect on hover, with a centered icon (e.g., zoom or view icon) */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300 pointer-events-none">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white bg-opacity-90 rounded-full p-3">
                {/* Example SVG icon for hover effect - could be a zoom or view icon */}
                <svg
                  className="w-6 h-6 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    // This path is for a magnifying glass with a plus - adjust as needed
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Placeholder if no image URL is available (e.g., item has no images)
        <div
          className="w-full h-full flex items-center justify-center bg-gray-100 cursor-pointer"
          onClick={openImageViewer} // Allow opening viewer even if it's just to show "no images" state
          role="img" // Semantically an image placeholder
          aria-label={`No image available for ${itemName}`}
        >
          <ShoppingBagIcon className="w-16 h-16 text-gray-400" />
        </div>
      )}

      {/* Navigation controls: Previous/Next buttons and image count/dots (if multiple images) */}
      {hasMultipleImages && (
        <>
          {/* Previous Image Button */}
          <button
            onClick={onPrevImage}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1.5 rounded-full hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          {/* Next Image Button */}
          <button
            onClick={onNextImage}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1.5 rounded-full hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next image"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
          {/* Image Count Display (e.g., "2 / 5") */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
            {currentImageIndex + 1} / {images.length}
          </div>
          {/* Dot Indicators for Image Navigation */}
          <div className="absolute bottom-2 left-2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={`dot-${index}`} // Unique key for each dot
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click if dot is clicked
                  onSetCurrentImageIndex(index); // Set image to the clicked dot's index
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  // Style for dots
                  index === currentImageIndex
                    ? "bg-white" // Active dot
                    : "bg-white bg-opacity-50 hover:bg-opacity-75" // Inactive dot
                }`}
                aria-label={`Go to image ${index + 1}`}
                aria-current={index === currentImageIndex ? "true" : "false"}
              />
            ))}
          </div>
        </>
      )}

      {/* "Photos" button/indicator (if images exist) - often an alternative way to open viewer */}
      {images.length > 0 && (
        <button
          onClick={openImageViewer}
          className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full hover:bg-opacity-80 transition-all"
          aria-label={`View all ${images.length} ${
            images.length === 1 ? "photo" : "photos"
          }`}
        >
          📷 {images.length} {images.length === 1 ? "Photo" : "Photos"}
        </button>
      )}
    </div>
  );
};
export default React.memo(ItemCardHeader);
