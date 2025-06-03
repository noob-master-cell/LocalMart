// src/services/imageService.js
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage, appId } from "../firebase"; // Assuming firebase.jsx exports these

class ImageService {
  /**
   * Uploads an image file to Firebase Storage with retry logic.
   * @param {File} file - The image file to upload.
   * @param {string} itemContextPath - The sub-path within Firebase Storage (e.g., "sell_items", "lostfound_items", "profile_pictures").
   * @param {Object} [options={}] - Upload options like maxRetries, retryDelay.
   * @returns {Promise<Object>} A promise resolving to an object with upload status, URL, and storage path.
   */
  async uploadImage(file, itemContextPath, options = {}) {
    const { maxRetries = 3, retryDelay = 1000 } = options;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (!file.type.startsWith("image/"))
          throw new Error("File must be an image");
        if (file.size > 5 * 1024 * 1024)
          // 5MB limit
          throw new Error("Image must be smaller than 5MB");

        const imageName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
        const storagePath = `images/${appId}/${itemContextPath}/${imageName}`;
        const storageRef = ref(storage, storagePath);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return { success: true, url: downloadURL, path: storagePath };
      } catch (error) {
        console.error(
          `Upload attempt ${attempt + 1} for ${file.name} failed:`,
          error
        );
        if (attempt === maxRetries - 1)
          return { success: false, error: error.message, file: file.name };
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * (attempt + 1))
        );
      }
    }
    return {
      success: false,
      error: "Upload failed after multiple retries",
      file: file.name,
    };
  }

  /**
   * Uploads multiple image files in batches to Firebase Storage.
   * @param {File[]} files - Array of image files.
   * @param {string} itemContextPath - The sub-path in Firebase Storage.
   * @param {Function} [onProgress] - Callback function for progress updates (receives a value from 0 to 1).
   * @returns {Promise<Object>} An object containing arrays of `successful` and `failed` uploads.
   */
  async uploadMultipleImages(files, itemContextPath, onProgress) {
    const results = { successful: [], failed: [] };
    const totalFiles = files.length;
    let completed = 0;
    const batchSize = 3;
    const batches = [];

    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const promises = batch.map(async (file) => {
        const result = await this.uploadImage(file, itemContextPath);
        if (result.success) {
          results.successful.push({
            file: file.name,
            url: result.url,
            path: result.path,
          });
        } else {
          results.failed.push({ file: file.name, error: result.error });
        }
        completed++;
        onProgress?.(completed / totalFiles);
      });
      await Promise.all(promises);
    }
    return results;
  }

  /**
   * Deletes an image from Firebase Storage.
   * @param {string} imagePath - The full path to the image in Firebase Storage.
   * @returns {Promise<Object>} An object indicating success or failure.
   */
  async deleteImage(imagePath) {
    if (!imagePath) {
      console.warn("Attempted to delete image with no path.");
      return {
        success: true,
        message: "No image path provided, nothing to delete.",
      };
    }
    try {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting image:", error);
      if (error.code === "storage/object-not-found") {
        console.warn(`Image not found at path for deletion: ${imagePath}`);
        return {
          success: true,
          message: "Image not found, considered deleted.",
        };
      }
      return { success: false, error: error.message };
    }
  }
}

export default new ImageService();
