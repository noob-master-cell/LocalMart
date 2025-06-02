// project/src/components/Media/ImageViewer/ThumbnailList.jsx
import React from "react";

const ThumbnailList = ({ images, currentIndex, onThumbnailClick }) => {
  if (!images || images.length <= 1) {
    return null; // Don't show thumbnails for 0 or 1 image
  }

  return (
    <div className="p-4">
      <div className="flex justify-center space-x-2 overflow-x-auto max-w-full">
        {images.map((image, index) => (
          <button
            key={index} // Consider a more stable key if images can change, e.g., image URL if unique
            onClick={() => onThumbnailClick(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              index === currentIndex
                ? "border-white"
                : "border-gray-600 hover:border-gray-400"
            }`}
            aria-label={`View image ${index + 1}`}
          >
            <img
              src={image} // Thumbnail source
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Basic fallback for broken thumbnail images
                e.target.onerror = null;
                // Simple text fallback, could be an icon or placeholder
                e.target.parentElement.innerHTML = `<div class="w-full h-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">${
                  index + 1
                }</div>`;
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ThumbnailList);
