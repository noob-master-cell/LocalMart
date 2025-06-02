// src/components/Items/ItemForm/ItemForm.jsx
import React, { useState, useEffect, useCallback } from "react";
import { auth, Timestamp } from "../../../firebase.jsx";
import firebaseService from "../../../services/firebaseService.js"; // Used by the hook, not directly here for uploads
import { CATEGORIES, LIMITS, ITEM_STATUS } from "../../../config/constants.js";
import ItemFormFields from "./ItemFormFields.jsx";
import ItemFormActions from "./ItemFormActions.jsx";
import { validateImageFile, validateWhatsApp } from "../../../utils/helpers.js";
import { compressImage } from "../../../utils/imageOptimizer.js";
import LoadingSpinner from "../../UI/LoadingSpinner.jsx";

const ItemForm = ({
  onSubmit, // This is the hook's handleSubmitItem
  initialData = {},
  type = "sell",
  onFormProcessing,
  // showMessage, // Optional prop for feedback
}) => {
  const [formData, setFormData] = useState({
    /* ... */
  });
  const [imageFiles, setImageFiles] = useState([]); // Holds NEW File objects (compressed)
  const [imagePreviews, setImagePreviews] = useState([]); // Holds URLs for display (initial http/https or new blob)

  // Stores initial images as {url: string, path: string | null}
  const [initialImages, setInitialImages] = useState([]);
  // Stores storage paths of initial images marked by user for removal
  const [removedInitialImagePaths, setRemovedInitialImagePaths] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [error, setError] = useState("");
  const isEditMode = !!initialData.id;

  useEffect(() => {
    const defaultDate = new Date().toISOString().split("T")[0];
    setFormData({
      name: initialData.name || "",
      description: initialData.description || "",
      price: initialData.price || "",
      category: initialData.category || "",
      whatsappNumber: initialData.whatsappNumber || "",
      lastSeenLocation: initialData.lastSeenLocation || "",
      dateFound: initialData.dateFound?.seconds
        ? new Date(initialData.dateFound.seconds * 1000)
            .toISOString()
            .split("T")[0]
        : type === "lostfound" &&
          (initialData.status === ITEM_STATUS.FOUND ||
            initialData.status === "found") &&
          !isEditMode
        ? defaultDate
        : "",
    });

    const currentInitialImages = (initialData.imageUrls || []).map(
      (url, index) => ({
        url,
        path: (initialData.imageStoragePaths || [])[index] || null,
      })
    );
    setInitialImages(currentInitialImages);
    setImagePreviews(currentInitialImages.map((img) => img.url));

    setImageFiles([]); // Reset new files
    setRemovedInitialImagePaths([]); // Reset removed paths
    setError("");
  }, [initialData, type, isEditMode]);

  const categories = type === "sell" ? CATEGORIES.SELL : CATEGORIES.LOST_FOUND;

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (error) setError("");
    },
    [error]
  );

  const handleImageChange = useCallback(
    async (e) => {
      setError("");
      setIsProcessingImages(true);
      const newFilesSelected = Array.from(e.target.files);
      const countOfAlreadyStagedImages = imagePreviews.length;

      if (
        countOfAlreadyStagedImages + newFilesSelected.length >
        LIMITS.MAX_IMAGES
      ) {
        setError(
          `You can upload a maximum of ${LIMITS.MAX_IMAGES} images. You currently have ${countOfAlreadyStagedImages} and are trying to add ${newFilesSelected.length}.`
        );
        e.target.value = null;
        setIsProcessingImages(false);
        return;
      }

      const newlyProcessedFiles = [];
      const newBlobPreviews = [];

      for (const file of newFilesSelected) {
        const validation = validateImageFile(file, LIMITS.MAX_IMAGE_SIZE);
        if (!validation.isValid) {
          console.warn(
            `Skipping invalid file ${file.name}: ${validation.error}`
          );
          // showMessage?.(`Skipped invalid file: ${file.name}`, "warning");
          continue;
        }
        try {
          const compressedFile = await compressImage(file);
          newlyProcessedFiles.push(compressedFile);
          newBlobPreviews.push(URL.createObjectURL(compressedFile));
        } catch (compressionError) {
          console.error(
            "Error compressing image:",
            file.name,
            compressionError
          );
          // showMessage?.(`Could not process image ${file.name}. Using original.`, "warning");
          newlyProcessedFiles.push(file); // Fallback to original
          newBlobPreviews.push(URL.createObjectURL(file));
        }
      }

      if (newlyProcessedFiles.length > 0) {
        setImageFiles((prev) => [...prev, ...newlyProcessedFiles]);
        setImagePreviews((prev) => [...prev, ...newBlobPreviews]);
      }

      e.target.value = null;
      setIsProcessingImages(false);
    },
    [imagePreviews.length, LIMITS.MAX_IMAGES /*, showMessage */]
  );

  const removeImage = useCallback(
    (indexToRemove) => {
      const previewToRemove = imagePreviews[indexToRemove];
      URL.revokeObjectURL(previewToRemove); // Clean up blob URL if it is one

      setImagePreviews((prev) => prev.filter((_, i) => i !== indexToRemove));

      // Check if the removed preview was from initialImages or imageFiles
      const initialImgIndex = initialImages.findIndex(
        (img) => img.url === previewToRemove
      );
      if (initialImgIndex > -1) {
        // It was an existing image from initialData
        const removedImg = initialImages[initialImgIndex];
        if (removedImg.path) {
          // Only add to removedInitialImagePaths if it had a path (was an uploaded image)
          setRemovedInitialImagePaths((prev) => [...prev, removedImg.path]);
        }
        // Remove from initialImages to prevent re-adding if form re-initializes with same initialData
        setInitialImages((prev) =>
          prev.filter((img) => img.url !== previewToRemove)
        );
      } else {
        // It was a newly added file (from imageFiles, represented by a blob URL in imagePreviews)
        // This requires careful indexing if imagePreviews contains mixed initial and new blob URLs.
        // A robust way is to find its corresponding File object in imageFiles and remove it.
        // This assumes that blob URLs in imagePreviews correspond positionally to files in imageFiles
        // AFTER the initial images' http URLs.

        // Count how many non-blob URLs (initial images still in preview) are before this index
        let nonBlobCountBefore = 0;
        for (let i = 0; i < indexToRemove; i++) {
          if (!imagePreviews[i].startsWith("blob:")) {
            nonBlobCountBefore++;
          }
        }
        // The index in imageFiles is indexToRemove - (count of initial images still in imagePreviews)
        // More simply: find the file object that created this blob URL (if possible, or track by index)
        // For now, assuming imageFiles directly correspond to the blob previews in order.
        const numInitialPreviewsStillPresent = imagePreviews.filter(
          (p) =>
            !p.startsWith("blob:") &&
            initialImages.some((initImg) => initImg.url === p)
        ).length;
        const fileIndexInImageFiles =
          indexToRemove - numInitialPreviewsStillPresent;

        if (
          fileIndexInImageFiles >= 0 &&
          fileIndexInImageFiles < imageFiles.length
        ) {
          setImageFiles((prevFiles) =>
            prevFiles.filter((_, i) => i !== fileIndexInImageFiles)
          );
        }
      }
    },
    [imagePreviews, initialImages, imageFiles]
  );

  useEffect(() => {
    // Cleanup for blob URLs
    return () => {
      imagePreviews.forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviews]); // Re-run if imagePreviews change

  const validateForm = useCallback(() => {
    // ... (same validation logic)
    const { name, description, category, price, whatsappNumber } = formData;
    if (!name.trim() || !description.trim() || !category) {
      return "Name, Description, and Category are required.";
    }
    if (
      type === "sell" &&
      (price === "" || isNaN(parseFloat(price)) || parseFloat(price) < 0)
    ) {
      return "A valid price is required for items for sale.";
    }
    const whatsappValidation = validateWhatsApp(whatsappNumber);
    if (!whatsappValidation.isValid) {
      return whatsappValidation.error;
    }
    if (imagePreviews.length === 0) {
      return "Please upload at least one image for the item.";
    }
    return null;
  }, [formData, type, imagePreviews.length]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }
      if (isProcessingImages) {
        setError("Please wait for images to finish processing.");
        return;
      }

      setIsSubmitting(true);
      onFormProcessing?.(true);

      try {
        // onSubmit (the hook's handleSubmitItem) will now handle uploads and structuring final data
        await onSubmit(
          formData, // Current form text data
          imageFiles, // NEW files (already compressed) to be uploaded
          isEditMode ? removedInitialImagePaths : [] // Paths of EXISTING images to be deleted (only in edit mode)
        );

        // Reset form state after successful submission
        if (!isEditMode) {
          // Full reset for new items
          setFormData({
            name: "",
            description: "",
            price: "",
            category: "",
            whatsappNumber: "",
            lastSeenLocation: "",
            dateFound: "",
          });
          setImageFiles([]);
          setImagePreviews([]);
          setInitialImages([]);
          setRemovedInitialImagePaths([]);
        } else {
          // Partial reset for edited items (newly added files processed, removed paths handled)
          setImageFiles([]); // Clear newly added files as they are now "existing" or uploaded
          setRemovedInitialImagePaths([]); // These have been processed
          // The parent component (e.g., SellingSection) will close the modal,
          // and if re-opened, initialData will be fresh.
        }
      } catch (submitError) {
        console.error("Form submission error in ItemForm:", submitError);
        setError(`Submission failed: ${submitError.message}`);
      } finally {
        setIsSubmitting(false);
        onFormProcessing?.(false);
      }
    },
    [
      formData,
      imageFiles, // New files to upload
      removedInitialImagePaths, // Existing image paths to delete
      isEditMode,
      validateForm,
      onSubmit,
      onFormProcessing,
      initialData, // Needed for context if resetting or for initial status
    ]
  );

  const lfLocationLabel =
    initialData.status === ITEM_STATUS.FOUND || initialData.status === "found"
      ? "Where Found *"
      : "Last Seen Location *";
  const lfLocationPlaceholder =
    initialData.status === ITEM_STATUS.FOUND || initialData.status === "found"
      ? "Where was the item found?"
      : "Where was it last seen?";
  const lfDateLabel =
    initialData.status === ITEM_STATUS.FOUND || initialData.status === "found"
      ? "Date Found"
      : "Date Lost";
  const lfDateHelperText =
    initialData.status === ITEM_STATUS.FOUND || initialData.status === "found"
      ? "Date when the item was found"
      : "Date when the item was lost";

  if (isSubmitting || isProcessingImages) {
    return (
      <LoadingSpinner
        message={
          isSubmitting
            ? isEditMode
              ? "Updating item..."
              : "Adding item..."
            : "Processing images..."
        }
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}
      <ItemFormFields
        formData={formData}
        type={type}
        initialDataStatus={initialData.status}
        categories={categories}
        LIMITS={LIMITS}
        imagePreviews={imagePreviews}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
        onRemoveImage={removeImage}
        lfLocationLabel={lfLocationLabel}
        lfLocationPlaceholder={lfLocationPlaceholder}
        lfDateLabel={lfDateLabel}
        lfDateHelperText={lfDateHelperText}
      />
      <ItemFormActions
        isSubmitting={isSubmitting || isProcessingImages}
        isEditMode={isEditMode}
        type={type}
        initialDataStatus={initialData.status}
        hasImages={imagePreviews.length > 0}
      />
    </form>
  );
};

export default React.memo(ItemForm);
