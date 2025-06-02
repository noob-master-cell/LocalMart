import React from "react";

/**
 * @component ThumbnailList
 * @description Displays a horizontal list of image thumbnails for navigation within an image viewer.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string[]} props.images - An array of image source URLs for the thumbnails.
 * @param {number} props.currentIndex - The index of the currently active (main) image.
 * @param {Function} props.onThumbnailClick - Callback function invoked when a thumbnail is clicked, passing its index.
 * @returns {JSX.Element|null} The list of thumbnails, or null if there are 1 or fewer images.
 */
const ThumbnailList = ({ images, currentIndex, onThumbnailClick }) => {
  // Do not render thumbnails if there's only one image or no images
  if (!images || images.length <= 1) {
    return null;
  }

  return (
    <div className="p-4">
      {" "}
      {/* Outer padding for the thumbnail container */}
      <div className="flex justify-center space-x-2 overflow-x-auto max-w-full">
        {images.map((imageSrc, index) => (
          <button
            key={imageSrc || index} // Use image URL as key if unique and available, otherwise fallback to index
            onClick={() => onThumbnailClick(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white
                        ${
                          index === currentIndex
                            ? "border-white" // Style for the active thumbnail
                            : "border-gray-600 hover:border-gray-400" // Style for inactive thumbnails
                        }`}
            aria-label={`View image ${index + 1}`}
            aria-current={index === currentIndex ? "true" : "false"}
          >
            <img
              src={imageSrc} // Source for the thumbnail image
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover" // Ensure image covers the button area
              loading="lazy" // Lazy load thumbnail images
              onError={(e) => {
                // Basic fallback for broken thumbnail images
                e.target.onerror = null; // Prevent infinite error loops
                // Replace with a placeholder or icon if image fails to load
                e.target.parentElement.innerHTML = `<div class="w-full h-full bg-gray-700 flex items-center justify-center text-xs text-gray-400 p-1" title="Error loading thumbnail">${
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
