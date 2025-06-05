import React, { useState, useEffect, useCallback, useRef } from "react";
// Firebase services and utilities are imported for data handling
import { Timestamp } from "../../../firebase.jsx";
import { CATEGORIES, LIMITS, ITEM_STATUS } from "../../../config/constants.js";
import ItemFormFields from "./ItemFormFields.jsx";
import ItemFormActions from "./ItemFormActions.jsx";
import { validateImageFile, validateWhatsApp } from "../../../utils/helpers.js";
import { compressImage } from "../../../utils/imageOptimizer.js";
import LoadingSpinner from "../../UI/LoadingSpinner.jsx";

/**
 * @component ItemForm
 * @description A comprehensive form for creating or editing items. It handles data input,
 * image uploads (with compression and validation), and submission logic.
 *
 * @param {object} props - The properties passed to the component.
 * @param {Function} props.onSubmit - Callback function to handle the form submission.
 * This is typically a hook's `handleSubmitItem` function.
 * @param {object} [props.initialData={}] - Initial data for the form, used when editing an existing item.
 * @param {string} [props.type="sell"] - The type of item form ('sell' or 'lostfound').
 * @param {Function} [props.onFormProcessing] - Callback to indicate if the form is currently processing (e.g., submitting, image processing).
 * @param {Function} [props.showMessage] - Optional callback to display user feedback messages. (Currently commented out in original)
 * @returns {JSX.Element} The item creation/editing form.
 */
const ItemForm = ({
  onSubmit,
  initialData = {},
  type = "sell", // 'sell' or 'lostfound'
  onFormProcessing,
  // showMessage, // Optional prop for providing feedback to the user
}) => {
  // State for form field data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    whatsappNumber: "",
    lastSeenLocation: "",
    dateFound: "",
    // Add other fields as necessary based on your schema
  });
  // State for new image files (File objects, compressed)
  const [imageFiles, setImageFiles] = useState([]);
  // State for image preview URLs (can be existing HTTPS URLs or new blob URLs)
  const [imagePreviews, setImagePreviews] = useState([]);

  // State to store initial images (from initialData) as objects {url: string, path: string | null}
  const [initialImages, setInitialImages] = useState([]);
  // State to store storage paths of initial images that the user marks for removal during an edit
  const [removedInitialImagePaths, setRemovedInitialImagePaths] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false); // True when form is being submitted
  const [isProcessingImages, setIsProcessingImages] = useState(false); // True when new images are being processed
  const [error, setError] = useState(""); // Form-level error message
  const isEditMode = !!initialData.id; // True if initialData has an ID, indicating an edit operation

  // Add this ref to track the blob URLs from the *previous* render
  const previousBlobUrlsRef = useRef(new Set());

  // Effect to initialize form data when initialData or type changes (e.g., when opening an edit form)
  useEffect(() => {
    const defaultDate = new Date().toISOString().split("T")[0]; // Default date for "found" items
    setFormData({
      name: initialData.name || "",
      description: initialData.description || "",
      price: initialData.price || "",
      category: initialData.category || "",
      whatsappNumber: initialData.whatsappNumber || "",
      lastSeenLocation: initialData.lastSeenLocation || "",
      dateFound: initialData.dateFound?.seconds // Convert Firestore Timestamp to ISO-MM-DD
        ? new Date(initialData.dateFound.seconds * 1000)
            .toISOString()
            .split("T")[0]
        : type === "lostfound" && // Set default date for new "found" items
          (initialData.status === ITEM_STATUS.FOUND ||
            initialData.status === "found") && // Check status explicitly
          !isEditMode
        ? defaultDate
        : "",
    });

    // Process initial images for previews and tracking
    const currentInitialImages = (initialData.imageUrls || []).map(
      (url, index) => ({
        url,
        path: (initialData.imageStoragePaths || [])[index] || null, // Store original storage path if available
      })
    );
    setInitialImages(currentInitialImages);
    setImagePreviews(currentInitialImages.map((img) => img.url)); // Set previews from URLs

    // Reset states for new image files and removed paths
    setImageFiles([]);
    setRemovedInitialImagePaths([]);
    setError(""); // Clear any previous errors
  }, [initialData, type, isEditMode]);

  // --- MODIFIED useEffect for cleaning up blob URLs ---
  useEffect(() => {
    // Collect all blob URLs from the *current* imagePreviews state
    const currentBlobUrlsInState = new Set(
      imagePreviews.filter((url) => url.startsWith("blob:"))
    );

    // Determine which blob URLs from the *previous* render are no longer in the *current* render
    const urlsToRevoke = [];
    previousBlobUrlsRef.current.forEach((prevUrl) => {
      if (!currentBlobUrlsInState.has(prevUrl)) {
        urlsToRevoke.push(prevUrl);
      }
    });

    // Revoke the URLs that are no longer present in the `imagePreviews` state
    urlsToRevoke.forEach((url) => {
      URL.revokeObjectURL(url);
      // console.log('Revoked old blob URL (no longer in state):', url); // Uncomment for debugging
    });

    // Update the ref to store the *current* set of blob URLs for the *next* render cycle
    previousBlobUrlsRef.current = currentBlobUrlsInState;

    // Cleanup function that runs when the component unmounts
    return () => {
      // console.log('ItemForm unmounted. Revoking all remaining blob URLs...'); // Uncomment for debugging
      // Revoke any blob URLs that are still in the ref when the component unmounts
      previousBlobUrlsRef.current.forEach((url) => {
        if (url.startsWith("blob:")) {
          // Ensure it's a blob URL
          URL.revokeObjectURL(url);
          // console.log('Revoked on unmount:', url); // Uncomment for debugging
        }
      });
      previousBlobUrlsRef.current = new Set(); // Clear the ref
    };
  }, [imagePreviews]); // This effect re-runs whenever the imagePreviews array reference changes

  // Determine categories based on form type
  const categories = type === "sell" ? CATEGORIES.SELL : CATEGORIES.LOST_FOUND;

  /**
   * Handles changes to text input fields.
   * @param {string} field - The name of the form field.
   * @param {string} value - The new value of the field.
   */
  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (error) setError(""); // Clear error on input change
    },
    [error] // Dependency: error state
  );

  /**
   * Handles new image file selection, including validation and compression.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event.
   */
  const handleImageChange = useCallback(
    async (e) => {
      setError(""); // Clear previous errors
      setIsProcessingImages(true);
      onFormProcessing?.(true); // Notify parent that form is processing

      const newFilesSelected = Array.from(e.target.files);
      const countOfAlreadyStagedImages = imagePreviews.length;

      // Validate maximum number of images
      if (
        countOfAlreadyStagedImages + newFilesSelected.length >
        LIMITS.MAX_IMAGES
      ) {
        setError(
          `You can upload a maximum of ${LIMITS.MAX_IMAGES} images. You currently have ${countOfAlreadyStagedImages} and are trying to add ${newFilesSelected.length}.`
        );
        e.target.value = null; // Reset file input
        setIsProcessingImages(false);
        onFormProcessing?.(false);
        return; // This return would prevent further processing but not reset the whole form.
      }

      const newlyProcessedFiles = []; // Store successfully processed File objects
      const newBlobPreviews = []; // Store blob URLs for new image previews

      for (const file of newFilesSelected) {
        const validation = validateImageFile(file, LIMITS.MAX_IMAGE_SIZE);
        if (!validation.isValid) {
          console.warn(
            `Skipping invalid file ${file.name}: ${validation.error}`
          );
          // showMessage?.(`Skipped invalid file: ${file.name} (${validation.error})`, "warning");
          continue; // Skip invalid files
        }
        try {
          const compressedFile = await compressImage(file); // Compress the image
          newlyProcessedFiles.push(compressedFile);
          const blobUrl = URL.createObjectURL(compressedFile);
          newBlobPreviews.push(blobUrl); // Create blob URL for preview
          // console.log('Created blob URL:', blobUrl); // Uncomment for debugging
        } catch (compressionError) {
          console.error(
            "Error compressing image:",
            file.name,
            compressionError
          );
          // showMessage?.(`Could not process image ${file.name}. Using original.`, "warning");
          // Fallback to original file if compression fails
          newlyProcessedFiles.push(file);
          const blobUrl = URL.createObjectURL(file); // Even if compression fails, create URL for original
          newBlobPreviews.push(blobUrl);
          // console.log('Created fallback blob URL:', blobUrl); // Uncomment for debugging
        }
      }

      // Update state with newly processed files and previews
      if (newlyProcessedFiles.length > 0) {
        setImageFiles((prevFiles) => [...prevFiles, ...newlyProcessedFiles]);
        setImagePreviews((prevPreviews) => [
          ...prevPreviews,
          ...newBlobPreviews,
        ]);
      }

      e.target.value = null; // Reset file input to allow re-selection of the same file
      setIsProcessingImages(false);
      onFormProcessing?.(false);
    },
    [
      imagePreviews.length,
      LIMITS.MAX_IMAGES,
      LIMITS.MAX_IMAGE_SIZE,
      onFormProcessing /*, showMessage*/,
    ]
  );

  /**
   * Removes an image from the preview list and manages related state for new or existing images.
   * @param {number} indexToRemove - The index of the image preview to remove.
   */
  const removeImage = useCallback(
    (indexToRemove) => {
      const previewToRemove = imagePreviews[indexToRemove];
      if (previewToRemove.startsWith("blob:")) {
        URL.revokeObjectURL(previewToRemove); // Clean up blob URL to prevent memory leaks
        // console.log('Revoked manually removed blob URL:', previewToRemove); // Uncomment for debugging
      }

      setImagePreviews((prevPreviews) =>
        prevPreviews.filter((_, i) => i !== indexToRemove)
      );

      // Determine if the removed image was an initial (existing) image or a newly added one
      const initialImgIndex = initialImages.findIndex(
        (img) => img.url === previewToRemove
      );

      if (initialImgIndex > -1) {
        // Image was part of initialData (an existing image)
        const removedImg = initialImages[initialImgIndex];
        if (removedImg.path) {
          // If it had a storage path, mark it for deletion from Firebase Storage on submit
          setRemovedInitialImagePaths((prevPaths) => [
            ...prevPaths,
            removedImg.path,
          ]);
        }
        // Remove from initialImages state to prevent it from being re-added if form re-initializes
        setInitialImages((prevInitial) =>
          prevInitial.filter((img) => img.url !== previewToRemove)
        );
      } else {
        // Image was a newly added file (represented by a blob URL)
        // This logic assumes that `imageFiles` corresponds to the 'blob:' previews
        // after all non-blob (initial) previews.
        const numInitialPreviewsStillPresent = imagePreviews.filter(
          (p, i) =>
            i < indexToRemove &&
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
        } else {
          // This case might occur if imagePreviews and imageFiles get out of sync,
          // or if the removed preview was an initial image that somehow didn't match the initialImages list.
          // It might be an edge case or indicate a logic issue in how previews/files are managed.
          console.warn(
            "Could not find corresponding file in imageFiles for removed preview:",
            previewToRemove
          );
        }
      }
    },
    [imagePreviews, initialImages, imageFiles] // Dependencies
  );

  /**
   * Validates the form data.
   * @returns {string|null} An error message if validation fails, otherwise null.
   */
  const validateForm = useCallback(() => {
    const {
      name,
      description,
      category,
      price,
      whatsappNumber,
      lastSeenLocation,
      dateFound,
    } = formData;
    if (!name.trim() || !description.trim() || !category) {
      return "Name, Description, and Category are required.";
    }
    if (
      type === "sell" &&
      (price === "" || isNaN(parseFloat(price)) || parseFloat(price) < 0)
    ) {
      return "A valid price is required for items for sale.";
    }
    if (type === "lostfound") {
      if (!lastSeenLocation.trim()) {
        return initialData.status === ITEM_STATUS.FOUND ||
          initialData.status === "found"
          ? "Location where item was found is required."
          : "Last seen location is required.";
      }
      // Date found/lost might be optional or required depending on business logic
      // if (!dateFound) return "Date is required for lost/found items.";
    }
    const whatsappValidation = validateWhatsApp(whatsappNumber);
    if (!whatsappValidation.isValid) {
      return whatsappValidation.error;
    }
    if (imagePreviews.length === 0) {
      // Must have at least one image
      return "Please upload at least one image for the item.";
    }
    if (imagePreviews.length > LIMITS.MAX_IMAGES) {
      // Double check max images, though handleImageChange should prevent this
      return `You can upload a maximum of ${LIMITS.MAX_IMAGES} images.`;
    }
    return null; // No errors
  }, [
    formData,
    type,
    imagePreviews.length,
    initialData.status,
    LIMITS.MAX_IMAGES,
  ]);

  /**
   * Handles the form submission process.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault(); // Prevent default form submission
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }
      if (isProcessingImages) {
        // Prevent submission if images are still processing
        setError("Please wait for images to finish processing.");
        return;
      }

      setIsSubmitting(true);
      onFormProcessing?.(true); // Notify parent about processing start

      // Prepare data for submission
      let dataToSubmit = { ...formData };
      if (type === "sell") {
        dataToSubmit.price = parseFloat(dataToSubmit.price);
        delete dataToSubmit.lastSeenLocation;
        delete dataToSubmit.dateFound;
      } else {
        // lostfound
        delete dataToSubmit.price;
        // Convert dateFound to Firestore Timestamp if it's a string
        if (
          dataToSubmit.dateFound &&
          typeof dataToSubmit.dateFound === "string"
        ) {
          // Assuming dateFound is in 'YYYY-MM-DD' format from the input type="date"
          dataToSubmit.dateFound = Timestamp.fromDate(
            new Date(dataToSubmit.dateFound)
          );
        } else if (!dataToSubmit.dateFound) {
          // If dateFound is empty, remove it or set to null, depending on backend requirements
          delete dataToSubmit.dateFound;
        }
        // Add status for lost/found items if it's part of initialData or needs to be set
        if (initialData.status) {
          dataToSubmit.status = initialData.status;
        }
      }

      try {
        // The onSubmit prop (from parent, likely useSubmitItem hook) handles the actual submission logic,
        // including uploading new images and deleting removed initial images.
        await onSubmit(
          dataToSubmit,
          imageFiles, // New File objects to be uploaded
          isEditMode ? removedInitialImagePaths : [] // Paths of existing images to delete (only in edit mode)
        );

        // Reset form state after successful submission
        if (!isEditMode) {
          // Full reset for new item creation
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
          setInitialImages([]); // Also clear initial images tracking for new form
        }
        // For edit mode, the parent component (e.g., a modal) typically closes,
        // and if reopened, initialData will be fresh. So, no full reset needed here,
        // but imageFiles (newly added) and removedInitialImagePaths are cleared as they've been processed.
        setImageFiles([]);
        setRemovedInitialImagePaths([]);
        setError(""); // Clear any errors
        // showMessage?.(isEditMode ? "Item updated successfully!" : "Item added successfully!", "success");
      } catch (submitError) {
        console.error("Form submission error in ItemForm:", submitError);
        setError(
          `Submission failed: ${
            submitError.message || "An unexpected error occurred."
          }`
        );
        // showMessage?.(`Submission failed: ${submitError.message}`, "error");
      } finally {
        setIsSubmitting(false);
        onFormProcessing?.(false); // Notify parent about processing end
      }
    },
    [
      formData,
      imageFiles,
      removedInitialImagePaths,
      isEditMode,
      type,
      validateForm,
      onSubmit,
      onFormProcessing,
      initialData.status, // Include if status logic depends on it
      // showMessage // Include if using showMessage
    ]
  );

  // Dynamic labels and placeholders for Lost & Found fields
  const currentItemStatus =
    initialData.status || (type === "lostfound" ? ITEM_STATUS.LOST : ""); // Default to LOST if creating new L&F
  const lfLocationLabel =
    currentItemStatus === ITEM_STATUS.FOUND
      ? "Where Found *"
      : "Last Seen Location *";
  const lfLocationPlaceholder =
    currentItemStatus === ITEM_STATUS.FOUND
      ? "E.g., Building A, Room 101"
      : "E.g., Near the library";
  const lfDateLabel =
    currentItemStatus === ITEM_STATUS.FOUND ? "Date Found" : "Date Lost";
  const lfDateHelperText =
    currentItemStatus === ITEM_STATUS.FOUND
      ? "Approximate date when the item was found."
      : "Approximate date when the item was lost.";

  // Display loading spinner if submitting or processing images
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
    <form onSubmit={handleSubmit} className="space-y-6 p-1" noValidate>
      {/* Display form-level error messages */}
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}
      {/* Render form fields */}
      <ItemFormFields
        formData={formData}
        type={type}
        initialDataStatus={currentItemStatus} // Pass current status for dynamic fields
        categories={categories}
        LIMITS={LIMITS}
        imagePreviews={imagePreviews}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
        onRemoveImage={removeImage}
        // Pass dynamic labels and placeholders for Lost & Found
        lfLocationLabel={lfLocationLabel}
        lfLocationPlaceholder={lfLocationPlaceholder}
        lfDateLabel={lfDateLabel}
        lfDateHelperText={lfDateHelperText}
      />
      {/* Render form actions (submit button) */}
      <ItemFormActions
        isSubmitting={isSubmitting || isProcessingImages} // Disable button during processing
        isEditMode={isEditMode}
        type={type}
        initialDataStatus={currentItemStatus}
        hasImages={imagePreviews.length > 0} // Enable submit only if images are present
      />
    </form>
  );
};

export default React.memo(ItemForm);
