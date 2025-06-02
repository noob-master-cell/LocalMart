// Items/ItemForm/ItemFormFields.jsx
import React from "react";
import XCircleIcon from "./../../icons/XCircleIcon";

const ItemFormFields = ({
  formData,
  type,
  initialDataStatus,
  categories,
  LIMITS,
  imagePreviews,
  onInputChange,
  onImageChange,
  onRemoveImage,
  // Dynamic labels for Lost & Found
  lfLocationLabel,
  lfLocationPlaceholder,
  lfDateLabel,
  lfDateHelperText,
}) => {
  return (
    <>
      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800">Basic Information</h4>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            required
            placeholder="Enter item name"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onInputChange("description", e.target.value)}
            required
            rows="4"
            placeholder="Describe the item in detail"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
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

      {/* Type-specific fields */}
      {type === "sell" ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (€) *
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => onInputChange("price", e.target.value)}
            required
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">
            {initialDataStatus === "found"
              ? "Found Item Details"
              : "Lost Item Details"}
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lfLocationLabel}
            </label>
            <input
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lfDateLabel}
            </label>
            <input
              type="date"
              value={formData.dateFound}
              onChange={(e) => onInputChange("dateFound", e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">{lfDateHelperText}</p>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          WhatsApp Number *
        </label>
        <input
          type="tel"
          value={formData.whatsappNumber}
          onChange={(e) => onInputChange("whatsappNumber", e.target.value)}
          placeholder="+1234567890"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Include country code (e.g., +1 for US, +44 for UK)
        </p>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images (Max {LIMITS.MAX_IMAGES}) *
        </label>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onImageChange}
          disabled={imagePreviews.length >= LIMITS.MAX_IMAGES}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 disabled:opacity-50"
        />

        <p className="text-xs text-gray-500 mt-1">
          {imagePreviews.length === 0
            ? "At least one image is required"
            : `${
                LIMITS.MAX_IMAGES - imagePreviews.length
              } more images can be added`}
        </p>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {imagePreviews.map((previewUrl, index) => (
              <div key={`${previewUrl}-${index}`} className="relative group">
                <img
                  src={previewUrl}
                  alt={`Preview ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 hover:bg-red-600"
                  aria-label="Remove image"
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
