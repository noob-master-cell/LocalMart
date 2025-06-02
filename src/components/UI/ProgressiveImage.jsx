// This component implements a progressive image loading strategy.
// It initially displays a placeholder (either a skeleton or a default image)
// and then loads the actual image. This improves perceived performance and user experience.
import React, { useState, memo, useEffect } from "react";
// Icon used as a fallback if the image fails to load.
import ShoppingBagIcon from "../Icons/ShoppingBagIcon";
// Helper function to generate placeholder image URLs.
import { getPlaceholderImage } from "../../utils/helpers";

/**
 * ProgressiveImage component.
 *
 * @param {object} props - Component props.
 * @param {string} props.src - The source URL of the actual image to load.
 * @param {string} props.alt - The alt text for the image.
 * @param {string} props.className - CSS classes for styling the image and placeholders.
 * @param {Function} [props.onClick] - Optional click handler for the image.
 * @param {string} [props.itemName] - Optional name of the item, used for placeholder text.
 * @returns {JSX.Element} The ProgressiveImage component.
 */
const ProgressiveImage = memo(({ src, alt, className, onClick, itemName }) => {
  const [isLoading, setIsLoading] = useState(true); // True while the main image is loading.
  const [hasError, setHasError] = useState(false); // True if the main image fails to load.
  const [imageSrc, setImageSrc] = useState(null); // Holds the src for the <img> tag, initially null.

  // Effect to handle image loading when the `src` prop changes.
  useEffect(() => {
    // Reset states for the new image.
    setIsLoading(true);
    setHasError(false);
    setImageSrc(null); // Clear previous image to ensure loading state is shown.

    const img = new Image(); // Create a new Image object to load the image in the background.
    img.onload = () => {
      // When the image successfully loads:
      setImageSrc(src); // Set the imageSrc to the actual source.
      setIsLoading(false); // Update loading state.
    };
    img.onerror = () => {
      // When the image fails to load:
      setHasError(true); // Set error state.
      setIsLoading(false); // Update loading state.
    };
    img.src = src; // Start loading the image.

    // Cleanup function to prevent memory leaks if the component unmounts before loading finishes.
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]); // Re-run effect if the `src` prop changes.

  // If there's an error loading the image, display a fallback icon.
  if (hasError) {
    return (
      <div
        className={`${className} bg-gray-100 flex items-center justify-center`} // Basic styling for error state.
        onClick={onClick} // Allow click even on error state.
      >
        <ShoppingBagIcon className="w-16 h-16 text-gray-400" />
      </div>
    );
  }

  return (
    <>
      {/* Display a skeleton/pulse animation while the image is loading. */}
      {isLoading && (
        <div className={`${className} bg-gray-200 animate-pulse`} />
      )}
      {/* The actual image tag.
          It uses `imageSrc` which is updated on load, or a placeholder if still loading/not set.
          The opacity transition provides a smooth visual effect. */}
      <img
        src={imageSrc || getPlaceholderImage(itemName || "Loading...")} // Show placeholder until loaded.
        alt={alt}
        className={`${className} ${
          isLoading ? "opacity-0" : "opacity-100" // Fade in effect.
        } transition-opacity duration-300`}
        onClick={onClick}
        loading="lazy" // Native lazy loading for browsers that support it.
        // Fallback for the `<img>` tag itself if `imageSrc` becomes invalid after initial load.
        onError={(e) => {
          e.target.onerror = null; // Prevent infinite loop on error.
          e.target.src = getPlaceholderImage(itemName || "No Image"); // Show a default placeholder.
          setHasError(true); // Also update state if this inline error occurs.
        }}
      />
    </>
  );
});
ProgressiveImage.displayName = "ProgressiveImage"; // For better debugging.
export default ProgressiveImage;
