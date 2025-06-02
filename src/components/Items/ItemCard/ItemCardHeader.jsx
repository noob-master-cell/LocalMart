// project/src/components/Items/ItemCard/ItemCardHeader.jsx
import React, { useMemo } from "react";
import ProgressiveImage from "../../UI/ProgressiveImage";
import ChevronLeftIcon from "../../Icons/ChevronLeftIcon";
import ChevronRightIcon from "../../Icons/ChevronRightIcon";
import ShoppingBagIcon from "../../Icons/ShoppingBagIcon";

const CARD_IMAGE_HEIGHT = "h-48";

const ItemCardHeader = ({
  images,
  currentImageIndex,
  openImageViewer,
  onPrevImage,
  onNextImage,
  onSetCurrentImageIndex,
  itemName,
}) => {
  const hasMultipleImages = images.length > 1;
  const currentImageUrl = useMemo(
    () => images[currentImageIndex] || null,
    [images, currentImageIndex]
  );

  return (
    <div
      className={`relative w-full ${CARD_IMAGE_HEIGHT} bg-gray-200 overflow-hidden group`}
    >
      {currentImageUrl ? (
        <>
          <ProgressiveImage
            src={currentImageUrl}
            alt={`${itemName || "Item Image"} ${
              hasMultipleImages
                ? `(${currentImageIndex + 1}/${images.length})`
                : ""
            }`}
            className="w-full h-full object-cover transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={openImageViewer}
            itemName={itemName}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300 pointer-events-none">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white bg-opacity-90 rounded-full p-3">
                <svg
                  className="w-6 h-6 text-gray-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div
          className="w-full h-full flex items-center justify-center bg-gray-100 cursor-pointer"
          onClick={openImageViewer}
        >
          <ShoppingBagIcon className="w-16 h-16 text-gray-400" />
        </div>
      )}
      {hasMultipleImages && (
        <>
          <button
            onClick={onPrevImage} // Changed from prevImage to onPrevImage
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1.5 rounded-full hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onNextImage} // Changed from nextImage to onNextImage
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1.5 rounded-full hover:bg-opacity-70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next image"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
            {currentImageIndex + 1} / {images.length}
          </div>
          <div className="absolute bottom-2 left-2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onSetCurrentImageIndex(index); // Changed
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex
                    ? "bg-white"
                    : "bg-white bg-opacity-50 hover:bg-opacity-75"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
      {images.length > 0 && (
        <button
          onClick={openImageViewer}
          className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full hover:bg-opacity-80 transition-all"
        >
          📷 {images.length} {images.length === 1 ? "Photo" : "Photos"}
        </button>
      )}
    </div>
  );
};
export default React.memo(ItemCardHeader);
