// This module provides utility functions for client-side image optimization,
// including compression, resizing, thumbnail generation, and preloading.

/**
 * Compresses and resizes an image file before upload.
 * Maintains aspect ratio while fitting within maxWidth and maxHeight.
 * Converts the image to JPEG format.
 *
 * @param {File} file - The image file to compress.
 * @param {number} [maxWidth=1200] - The maximum width for the compressed image.
 * @param {number} [maxHeight=1200] - The maximum height for the compressed image.
 * @param {number} [quality=0.8] - The JPEG quality (0-1) for the compressed image.
 * @returns {Promise<File>} A promise that resolves with the compressed image file.
 * If compression doesn't reduce size, the original file is returned.
 * @rejects {Error} If file reading, image loading, or canvas conversion fails.
 */
export const compressImage = async (
  file,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Handle successful file reading
    reader.onload = (event) => {
      const img = new Image();

      // Handle successful image loading
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        // Enable high-quality image smoothing for better resize results
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw the resized image onto the canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas content to a Blob (JPEG format)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new File object from the compressed blob
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg", // Output format
                lastModified: Date.now(),
              });

              // Resolve with the original file if compression didn't reduce size
              if (compressedFile.size < file.size) {
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            } else {
              reject(new Error("Canvas to Blob conversion failed"));
            }
          },
          "image/jpeg", // Specify JPEG format
          quality // Specify JPEG quality
        );
      };

      // Handle image loading errors
      img.onerror = () => reject(new Error("Image load failed"));
      // Set the image source to the result of FileReader (Data URL)
      img.src = event.target.result;
    };

    // Handle file reading errors
    reader.onerror = () => reject(new Error("File read failed"));
    // Read the file as a Data URL
    reader.readAsDataURL(file);
  });
};

/**
 * Batch compresses multiple image files.
 *
 * @param {File[]} files - An array of image files to compress.
 * @param {Object} [options={}] - Compression options (maxWidth, maxHeight, quality).
 * @returns {Promise<File[]>} A promise that resolves with an array of compressed files.
 * Original files are returned for any that fail compression.
 */
export const batchCompressImages = async (files, options = {}) => {
  // Destructure options with default values
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = options;

  // Create an array of compression promises
  const compressionPromises = files.map((file) =>
    compressImage(file, maxWidth, maxHeight, quality).catch((error) => {
      // Log errors for individual file compressions and return the original file
      console.error(`Failed to compress ${file.name}:`, error);
      return file;
    })
  );

  // Wait for all compression promises to resolve
  return Promise.all(compressionPromises);
};

/**
 * Generates a square thumbnail from an image file.
 * The thumbnail is cropped to a square from the center of the image.
 *
 * @param {File} file - The image file to generate a thumbnail from.
 * @param {number} [size=150] - The desired size (width and height) of the thumbnail.
 * @returns {Promise<string>} A promise that resolves with a base64 Data URL of the thumbnail.
 * @rejects {Error} If file reading or thumbnail generation fails.
 */
export const generateThumbnail = async (file, size = 150) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calculate dimensions for square cropping from the center
        const minDimension = Math.min(img.width, img.height);
        const sx = (img.width - minDimension) / 2; // Source X
        const sy = (img.height - minDimension) / 2; // Source Y

        canvas.width = size;
        canvas.height = size;

        // Enable high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw the cropped square image onto the canvas
        ctx.drawImage(
          img,
          sx, // Source X
          sy, // Source Y
          minDimension, // Source width
          minDimension, // Source height
          0, // Destination X
          0, // Destination Y
          size, // Destination width
          size // Destination height
        );

        // Resolve with the base64 Data URL of the thumbnail (JPEG format)
        resolve(canvas.toDataURL("image/jpeg", 0.7)); // 0.7 quality for thumbnail
      };

      img.onerror = () => reject(new Error("Thumbnail generation failed"));
      img.src = event.target.result;
    };

    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
};

/**
 * Preloads an array of image URLs to improve perceived performance.
 * This helps ensure images are already cached by the browser when they need to be displayed.
 *
 * @param {string[]} urls - An array of image URLs to preload.
 * @returns {Promise<void>} A promise that resolves when all images have attempted to load.
 * It does not reject on individual image load failures but logs them.
 */
export const preloadImages = async (urls) => {
  // Create an array of image loading promises
  const promises = urls.map((url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve; // Resolve on successful load
      img.onerror = reject; // Reject on error
      img.src = url;
    });
  });

  try {
    // Wait for all images to attempt loading
    await Promise.all(promises);
  } catch (error) {
    // Log if some images failed to preload, but don't let it break the flow
    console.error("Some images failed to preload:", error);
  }
};

/**
 * Gets the dimensions (width and height) of an image file.
 *
 * @param {File} file - The image file.
 * @returns {Promise<{width: number, height: number}>} A promise that resolves with an object
 * containing the width and height of the image.
 * @rejects {Error} If the file is not an image, or if file reading/image loading fails.
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    // Validate if the file is an image
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image."));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resolve with image dimensions
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = (error) => {
        reject(new Error("Failed to load image to get dimensions: " + error));
      };
      // event.target.result contains the base64 encoded image data
      img.src = event.target.result;
    };

    reader.onerror = (error) => {
      reject(new Error("Failed to read file to get dimensions: " + error));
    };

    // Read the file as a Data URL to access its content
    reader.readAsDataURL(file);
  });
};
