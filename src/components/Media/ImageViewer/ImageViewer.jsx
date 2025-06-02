import React, { useState, useEffect, useCallback } from "react";
import XCircleIcon from "../../Icons/XCircleIcon";
import ImageDisplay from "./ImageModal"; // Main image display area
import ThumbnailList from "./ThumbnailList"; // List of thumbnails

/**
 * @component ImageViewer
 * @description A modal component for viewing a collection of images with thumbnails and navigation.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string[]} [props.images=[]] - An array of image source URLs.
 * @param {number} [props.initialIndex=0] - The index of the image to display initially.
 * @param {boolean} [props.isOpen=false] - Controls the visibility of the image viewer.
 * @param {Function} props.onClose - Callback function to close the image viewer.
 * @param {string} [props.itemName="Item"] - Name of the item being viewed, used in titles and alt text.
 * @returns {JSX.Element|null} The ImageViewer modal if `isOpen` and images are present, otherwise null.
 */
const ImageViewer = ({
  images = [],
  initialIndex = 0,
  isOpen = false,
  onClose,
  itemName = "Item",
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isImageLoading, setIsImageLoading] = useState(true); // Loading state for the main image
  const [imageHasError, setImageHasError] = useState(false); // Error state for the main image

  // Effect to reset state when the viewer is opened or essential props change
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsImageLoading(true); // Assume new image will start loading
      setImageHasError(false);
    }
  }, [isOpen, initialIndex, images]); // `images` dependency for cases where the image list itself changes

  // Effect to reset loading/error state when the current image index changes
  useEffect(() => {
    if (isOpen && images.length > 0) {
      setIsImageLoading(true);
      setImageHasError(false);
    }
  }, [currentIndex, isOpen, images.length]); // Re-check when current image changes

  /**
   * Navigates to the next image in the list.
   * @type {Function}
   */
  const handleNext = useCallback(() => {
    if (images.length > 1) { // Only navigate if there's more than one image
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  }, [images.length]);

  /**
   * Navigates to the previous image in the list.
   * @type {Function}
   */
  const handlePrevious = useCallback(() => {
    if (images.length > 1) { // Only navigate if there's more than one image
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  }, [images.length]);

  /**
   * Sets the current image based on a thumbnail click.
   * @param {number} index - The index of the clicked thumbnail.
   * @type {Function}
   */
  const handleThumbnailClick = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  /**
   * Callback for when the main image has loaded successfully.
   * @type {Function}
   */
  const handleImageLoad = useCallback(() => {
    setIsImageLoading(false);
    setImageHasError(false);
  }, []);

  /**
   * Callback for when the main image fails to load.
   * @type {Function}
   */
  const handleImageError = useCallback(() => {
    setIsImageLoading(false);
    setImageHasError(true);
  }, []);

  // Effect for keyboard navigation (Escape, Left Arrow, Right Arrow)
  useEffect(() => {
    if (!isOpen) return; // Only attach listener if viewer is open

    const handleKeyPress = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") handlePrevious();
      else if (e.key === "ArrowRight") handleNext();
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress); // Cleanup listener
  }, [isOpen, onClose, handlePrevious, handleNext]);

  // Do not render if not open or no images are provided
  if (!isOpen || !images || images.length === 0) return null;

  const currentImageSrc = images[currentIndex]; // Get the current image URL

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4"
      onClick={onClose} // Clicking on the backdrop closes the viewer
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-viewer-title"
      aria-describedby="image-viewer-description"
    >
      <div
        className="relative max-w-7xl max-h-full w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the content from closing the viewer
      >
        {/* Header section with item name, image count, and close button */}
        <div className="flex items-center justify-between p-4 text-white flex-shrink-0">
          <div>
            <h3
              id="image-viewer-title"
              className="text-lg font-semibold truncate max-w-md"
              title={itemName}
            >
              {itemName}
            </h3>
            {images.length > 1 && (
              <p className="text-sm text-gray-300">
                Image {currentIndex + 1} of {images.length}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
            aria-label="Close image viewer"
          >
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>

        {/* Main image display area */}
        <ImageDisplay
          currentImageSrc={currentImageSrc}
          altText={`${itemName} - Image ${currentIndex + 1}`}
          isLoading={isImageLoading}
          imageError={imageHasError}
          onImageLoad={handleImageLoad}
          onImageError={handleImageError}
          onPrevious={handlePrevious}
          onNext={handleNext}
          showNavigationArrows={images.length > 1}
        />

        {/* Thumbnail list for navigation */}
        <ThumbnailList
          images={images}
          currentIndex={currentIndex}
          onThumbnailClick={handleThumbnailClick}
        />

        {/* Optional footer with instructions */}
        <div id="image-viewer-description" className="text-center text-gray-400 text-sm pb-4 flex-shrink-0">
          <p>
            Use arrow keys to navigate &bull; Press ESC to close
            {images.length > 1 && " \u2022 Click thumbnails to jump to image"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ImageViewer);