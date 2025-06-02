// project/src/components/Media/ImageViewer/ImageViewer.jsx
import React, { useState, useEffect, useCallback } from "react";
import XCircleIcon from "../../Icons/XCircleIcon"; // Adjusted path
import ImageDisplay from "./ImageModal"; // Importing the component correctly (was ImageDisplay, file is ImageModal.jsx)
import ThumbnailList from "./ThumbnailList";

const ImageViewer = ({
  images = [],
  initialIndex = 0,
  isOpen = false,
  onClose,
  itemName = "Item",
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isImageLoading, setIsImageLoading] = useState(true); // Specific to the main image
  const [imageHasError, setImageHasError] = useState(false);

  // Reset state when images or initialIndex change, or when re-opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsImageLoading(true); // Assume new image will load
      setImageHasError(false);
    }
  }, [isOpen, initialIndex, images]); // images dependency in case the list of images itself changes

  // Update loading/error state when currentIndex changes (new image to display)
  useEffect(() => {
    if (isOpen && images.length > 0) {
      setIsImageLoading(true);
      setImageHasError(false);
    }
  }, [currentIndex, isOpen, images.length]);

  const handleNext = useCallback(() => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  }, [images.length]);

  const handlePrevious = useCallback(() => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  }, [images.length]);

  const handleThumbnailClick = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const handleImageLoad = useCallback(() => {
    setIsImageLoading(false);
    setImageHasError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsImageLoading(false);
    setImageHasError(true);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyPress = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") handlePrevious();
      else if (e.key === "ArrowRight") handleNext();
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, onClose, handlePrevious, handleNext]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImageSrc = images[currentIndex];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4"
      onClick={onClose} // Click on backdrop closes
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-viewer-title"
    >
      <div
        className="relative max-w-7xl max-h-full w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 text-white flex-shrink-0">
          <div>
            <h3
              id="image-viewer-title"
              className="text-lg font-semibold truncate max-w-md"
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

        {/* Main Image Display Area */}
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

        {/* Thumbnails */}
        <ThumbnailList
          images={images}
          currentIndex={currentIndex}
          onThumbnailClick={handleThumbnailClick}
        />

        {/* Instructions (Optional Footer) */}
        <div className="text-center text-gray-400 text-sm pb-4 flex-shrink-0">
          <p>
            Use arrow keys to navigate • Press ESC to close
            {images.length > 1 && " • Click thumbnails to jump to image"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ImageViewer);
