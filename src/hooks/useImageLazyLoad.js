// This custom React hook implements lazy loading for images.
// It initially shows a placeholder and only loads the actual image
// when the image element enters the viewport, using IntersectionObserver.

import { useEffect, useRef, useState } from "react";

/**
 * `useImageLazyLoad` hook.
 * Manages the state for lazy loading an image.
 *
 * @param {string} src - The source URL of the actual image to be loaded.
 * @param {string} placeholder - The source URL of a placeholder image (e.g., a low-quality version or a generic placeholder).
 * @returns {object} An object containing:
 * `imageSrc` (string): The current source for the <img> tag (placeholder or actual image).
 * `setImageRef` (Function): A ref callback to attach to the <img> element for IntersectionObserver.
 * `isLoaded` (boolean): True if the actual image has successfully loaded.
 * `isError` (boolean): True if there was an error loading the actual image.
 * `onLoad` (Function): Callback to be attached to the <img> `onLoad` event.
 * `onError` (Function): Callback to be attached to the <img> `onError` event.
 */
export const useImageLazyLoad = (src, placeholder) => {
  // State for the current image source to be used by the <img> tag.
  // Initially set to the placeholder.
  const [imageSrc, setImageSrc] = useState(placeholder);
  // State to hold the reference to the <img> DOM element.
  // This is set via a ref callback.
  const [imageRef, setImageRef] = useState(); // Note: this will be the DOM element itself, not a React ref object.
  // State to track if the main image has loaded successfully.
  const [isLoaded, setIsLoaded] = useState(false);
  // State to track if an error occurred while loading the main image.
  const [isError, setIsError] = useState(false);

  /**
   * Callback for the <img> `onLoad` event.
   * Sets `isLoaded` to true and updates `imageSrc` to the actual image `src`
   * if it's not already set (though `useEffect` below primarily handles `src` update).
   */
  const onLoad = () => {
    setIsLoaded(true);
    // This line might be redundant if `imageSrc` is already `src` due to observer,
    // but ensures `isLoaded` is true when the browser confirms load.
    // It's generally good practice to ensure the final `src` is displayed upon successful load.
    setImageSrc(src);
  };

  /**
   * Callback for the <img> `onError` event.
   * Sets `isError` to true.
   */
  const onError = () => {
    setIsError(true);
    // Optionally, you could set imageSrc to a specific error placeholder here.
    // setImageSrc(errorPlaceholderImage);
  };

  // useEffect to set up the IntersectionObserver for the image element.
  useEffect(() => {
    // If `imageRef` (the <img> DOM element) is not yet available, do nothing.
    if (!imageRef) return;

    // Create an IntersectionObserver.
    // The observer's callback is triggered when the image enters or exits the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // If the image is intersecting (visible in the viewport):
          if (entry.isIntersecting) {
            // Set the `src` attribute of the <img> element to the actual image URL.
            // This triggers the browser to start loading the image.
            // The `onLoad` and `onError` handlers defined above will then be called.
            imageRef.src = src; // Direct DOM manipulation to trigger load
            // Once the image starts loading, unobserve it to prevent further callbacks.
            observer.unobserve(imageRef);
          }
        });
      },
      { threshold: 0.1 } // Trigger when at least 10% of the image is visible.
    );

    // Start observing the image element.
    if (imageRef) {
      observer.observe(imageRef);
    }

    // Cleanup function: Unobserve the image when the component unmounts or dependencies change.
    return () => {
      if (imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, src]); // Dependencies: re-run effect if `imageRef` or `src` changes.

  // Return the state and handlers for the component to use.
  return {
    imageSrc, // Current src for the <img> tag.
    setImageRef, // Ref callback to attach to the <img> tag.
    isLoaded, // Loading status.
    isError, // Error status.
    onLoad, // onLoad event handler for <img>.
    onError, // onError event handler for <img>.
  };
};
