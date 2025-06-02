import React from "react";
import XCircleIcon from "./../../icons/XCircleIcon"; // Icon for removing images

/**
 * @component ItemFormFields
 * @description Renders the various input fields for the item form.
 * It includes fields for basic information, type-specific details (sell vs. lost/found),
 * contact information, and image uploads with previews.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.formData - The current state of the form data.
 * @param {string} props.type - The type of item form ('sell' or 'lostfound').
 * @param {string} props.initialDataStatus - The status of the item if it's lost/found (e.g., 'lost', 'found').
 * @param {string[]} props.categories - An array of available categories for the item.
 * @param {object} props.LIMITS - An object containing limits (e.g., MAX_IMAGES).
 * @param {string[]} props.imagePreviews - An array of URLs for image previews.
 * @param {Function} props.onInputChange - Callback function to handle changes in input fields.
 * @param {Function} props.onImageChange - Callback function to handle new image file selections.
 * @param {Function} props.onRemoveImage - Callback function to remove an image.
 * @param {string} props.lfLocationLabel - Dynamic label for the location field in lost/found forms.
 * @param {string} props.lfLocationPlaceholder - Dynamic placeholder for the location field.
 * @param {string} props.lfDateLabel - Dynamic label for the date field in lost/found forms.
 * @param {string} props.lfDateHelperText - Dynamic helper text for the date field.
 * @returns {JSX.Element} A collection of form fields.
 */
const ItemFormFields = ({
  formData,
  type,
  initialDataStatus, // e.g., 'lost', 'found' for L&F items
  categories,
  LIMITS,
  imagePreviews,
  onInputChange,
  onImageChange,
  onRemoveImage,
  // Dynamic labels and placeholders for Lost & Found section
  lfLocationLabel,
  lfLocationPlaceholder,
  lfDateLabel,
  lfDateHelperText,
}) => {
  return (
    <>
      {/* Section: Basic Information (Name, Description, Category) */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800">Basic Information</h4>

        {/* Item Name Field */}
        <div>
          <label
            htmlFor="itemName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Item Name *
          </label>
          <input
            id="itemName"
            type="text"
            value={formData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            required
            placeholder="E.g., Used Bicycle, Lost Keys"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            aria-describedby="itemNameHelp"
          />
          {/* Optional: <p id="itemNameHelp" className="text-xs text-gray-500 mt-1">Keep it concise and descriptive.</p> */}
        </div>

        {/* Item Description Field */}
        <div>
          <label
            htmlFor="itemDescription"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description *
          </label>
          <textarea
            id="itemDescription"
            value={formData.description}
            onChange={(e) => onInputChange("description", e.target.value)}
            required
            rows="4"
            placeholder="Provide details about the item, its condition, etc."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            aria-describedby="itemDescriptionHelp"
          />
          {/* Optional: <p id="itemDescriptionHelp" className="text-xs text-gray-500 mt-1">Be as specific as possible.</p> */}
        </div>

        {/* Item Category Field */}
        <div>
          <label
            htmlFor="itemCategory"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category *
          </label>
          <select
            id="itemCategory"
            value={formData.category}
            onChange={(e) => onInputChange("category", e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Section: Type-specific fields (Price for 'sell', Location/Date for 'lostfound') */}
      {type === "sell" ? (
        // Price Field (only for 'sell' type)
        <div>
          <label
            htmlFor="itemPrice"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Price (€) *
          </label>
          <input
            id="itemPrice"
            type="number"
            value={formData.price}
            onChange={(e) => onInputChange("price", e.target.value)}
            required
            min="0" // Price cannot be negative
            step="0.01" // Allows for cents
            placeholder="0.00"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            aria-describedby="itemPriceHelp"
          />
          {/* Optional: <p id="itemPriceHelp" className="text-xs text-gray-500 mt-1">Enter 0 for a free item.</p> */}
        </div>
      ) : (
        // Lost & Found Specific Fields
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">
            {initialDataStatus === "found" // Dynamic section title
              ? "Found Item Details"
              : "Lost Item Details"}
          </h4>

          {/* Location Field (Lost/Found) */}
          <div>
            <label
              htmlFor="lfLocation"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {lfLocationLabel} {/* Dynamic label */}
            </label>
            <input
              id="lfLocation"
              type="text"
              value={formData.lastSeenLocation}
              onChange={(e) =>
                onInputChange("lastSeenLocation", e.target.value)
              }
              required
              placeholder={lfLocationPlaceholder}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Date Field (Lost/Found) */}
          <div>
            <label
              htmlFor="lfDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {lfDateLabel} {/* Dynamic label */}
            </label>
            <input
              id="lfDate"
              type="date" // HTML5 date input
              value={formData.dateFound} // Should be in YYYY-MM-DD format for input value
              onChange={(e) => onInputChange("dateFound", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-describedby="lfDateHelp"
            />
            <p id="lfDateHelp" className="text-xs text-gray-500 mt-1">
              {lfDateHelperText}
            </p>{" "}
            {/* Dynamic helper text */}
          </div>
        </div>
      )}

      {/* Section: Contact Information */}
      <div>
        <label
          htmlFor="whatsappNumber"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          WhatsApp Number *
        </label>
        <input
          id="whatsappNumber"
          type="tel" // Use 'tel' for telephone numbers
          value={formData.whatsappNumber}
          onChange={(e) => onInputChange("whatsappNumber", e.target.value)}
          placeholder="+1234567890"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          aria-describedby="whatsappHelp"
        />
        <p id="whatsappHelp" className="text-xs text-gray-500 mt-1">
          Include country code (e.g., +1 for US, +44 for UK). This will be used
          for contact.
        </p>
      </div>

      {/* Section: Image Uploads */}
      <div>
        <label
          htmlFor="itemImages"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Images (Max {LIMITS.MAX_IMAGES}) *
        </label>

        <input
          id="itemImages"
          type="file"
          accept="image/*" // Accept all image types
          multiple // Allow multiple file selection
          onChange={onImageChange}
          // Disable input if max number of images already selected/previewed
          disabled={imagePreviews.length >= LIMITS.MAX_IMAGES}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 disabled:opacity-50"
          aria-describedby="imageUploadHelp"
        />

        <p id="imageUploadHelp" className="text-xs text-gray-500 mt-1">
          {imagePreviews.length === 0
            ? "At least one image is required."
            : `${
                LIMITS.MAX_IMAGES - imagePreviews.length
              } more images can be added.`}
          {` Max file size: ${
            LIMITS.MAX_IMAGE_SIZE / 1024 / 1024
          }MB per image.`}
        </p>

        {/* Image Previews Area */}
        {imagePreviews.length > 0 && (
          <div
            className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            aria-live="polite"
          >
            {imagePreviews.map((previewUrl, index) => (
              <div
                key={`${previewUrl}-${index}`}
                className="relative group aspect-w-1 aspect-h-1"
              >
                {" "}
                {/* Ensure aspect ratio for previews */}
                <img
                  src={previewUrl}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg shadow-sm"
                />
                {/* Button to remove an individual image preview */}
                <button
                  type="button" // Important: type="button" to prevent form submission
                  onClick={() => onRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 hover:bg-red-600"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <XCircleIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(ItemFormFields);
