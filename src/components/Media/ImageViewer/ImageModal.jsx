import React from "react";
import ChevronLeftIcon from "../../Icons/ChevronLeftIcon";
import ChevronRightIcon from "../../Icons/ChevronRightIcon";

/**
 * @component ImageDisplay
 * @description Displays a single image with loading and error states, and optional navigation arrows.
 * This component is typically used as the main image area within an image viewer or modal.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} [props.currentImageSrc] - The source URL of the image to display.
 * @param {string} props.altText - The alt text for the image.
 * @param {boolean} props.isLoading - Indicates if the image is currently loading.
 * @param {boolean} props.imageError - Indicates if there was an error loading the image.
 * @param {Function} props.onImageLoad - Callback function invoked when the image successfully loads.
 * @param {Function} props.onImageError - Callback function invoked when the image fails to load.
 * @param {Function} props.onPrevious - Callback function for navigating to the previous image.
 * @param {Function} props.onNext - Callback function for navigating to the next image.
 * @param {boolean} props.showNavigationArrows - If true, displays previous/next navigation arrows.
 * @returns {JSX.Element} The image display area.
 */
const ImageDisplay = ({
  currentImageSrc,
  altText,
  isLoading,
  imageError,
  onImageLoad,
  onImageError,
  onPrevious,
  onNext,
  showNavigationArrows,
}) => {
  return (
    <div className="flex-1 flex items-center justify-center relative min-h-0 w-full h-full">
      {/* Loading spinner shown while the image is loading */}
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-live="polite"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {/* Error message shown if image fails to load and not currently loading */}
      {imageError && !isLoading && (
        <div className="text-white text-center p-4">
          <p className="text-xl mb-2">Failed to load image</p>
          {/* A retry button could be implemented here, calling a passed-in retry handler */}
        </div>
      )}

      {/* Image tag, displayed if there's no error and a source is provided */}
      {!imageError && currentImageSrc && (
        <img
          src={currentImageSrc}
          alt={altText}
          className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100" // Fade-in effect
          }`}
          onLoad={onImageLoad}
          onError={onImageError}
          draggable={false} // Prevents native browser image dragging
        />
      )}

      {/* Message for when no image source is provided, and not loading or in error state */}
      {!currentImageSrc && !isLoading && !imageError && (
        <div className="text-white text-center p-4">
          <p className="text-xl mb-2">No image to display</p>
        </div>
      )}

      {/* Navigation arrows for cycling through images, if enabled */}
      {showNavigationArrows && (
        <>
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-70 p-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 hover:bg-opacity-70 p-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next image"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
};

// Exporting the memoized component as default.
// The filename is ImageModal.jsx, suggesting this is the core part of an image viewing modal.
export default React.memo(ImageDisplay);
