// project/src/components/Media/ImageViewer/ImageModal.jsx
import React from "react";
import ChevronLeftIcon from "../../Icons/ChevronLeftIcon"; // Adjusted path
import ChevronRightIcon from "../../Icons/ChevronRightIcon"; // Adjusted path

const ImageDisplay = ({
  // Internally I might call it ImageDisplay for clarity
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
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {imageError &&
        !isLoading && ( // Only show error if not also loading
          <div className="text-white text-center">
            <p className="text-xl mb-2">Failed to load image</p>
            {/* Retry button could be added here, calling a passed-in retry handler */}
          </div>
        )}

      {!imageError &&
        currentImageSrc && ( // Ensure currentImageSrc is available
          <img
            src={currentImageSrc}
            alt={altText}
            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={onImageLoad}
            onError={onImageError}
            draggable={false}
          />
        )}
      {!currentImageSrc &&
        !isLoading &&
        !imageError && ( // Case for no images or empty src
          <div className="text-white text-center">
            <p className="text-xl mb-2">No image to display</p>
          </div>
        )}

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

// Renaming to ImageModal.jsx as per user's structure for the export
export default React.memo(ImageDisplay); // Internally ImageDisplay, exported as default for ImageModal.jsx
