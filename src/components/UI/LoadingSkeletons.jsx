// This module provides various skeleton loader components.
// Skeletons are used as placeholders while content is loading, improving perceived performance.
import React from "react";

// Base component for all skeletons, providing the shimmer animation.
const SkeletonBase = ({ className = "", children, ...props }) => (
  <>
    <div
      // Applies base styling and the shimmer animation.
      // `bg-gradient-to-r` creates a horizontal gradient.
      // `from-gray-200 via-gray-300 to-gray-200` defines the gradient colors.
      // `bg-[length:200%_100%]` makes the background twice as wide as the element for the shimmer effect.
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${className}`}
      style={{
        animation: "shimmer 1.5s ease-in-out infinite", // CSS animation properties.
      }}
      {...props}
    >
      {children}{" "}
      {/* Allows nesting other elements if needed, though typically skeletons are empty. */}
    </div>
    {/* Inline style for the shimmer animation keyframes. */}
    <style>
      {`
        @keyframes shimmer {
          0% { background-position: 200% 0; } /* Start position of the gradient */
          100% { background-position: -200% 0; } /* End position, creating the sliding effect */
        }
      `}
    </style>
  </>
);

// Skeleton loader for an Item Card. Mimics the layout of a typical ItemCard component.
export const ItemCardSkeleton = ({
  className = "",
  isLostAndFound = false,
}) => (
  <div
    className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full ${className}`}
  >
    {/* Image placeholder skeleton. */}
    <SkeletonBase className="w-full h-56 bg-gray-200" />

    {/* Content placeholder skeleton. */}
    <div className="p-5 flex-grow flex flex-col space-y-3">
      {/* Title placeholder. */}
      <SkeletonBase className="h-6 bg-gray-200 rounded w-3/4" />

      {/* Description placeholder (multiple lines). */}
      <div className="space-y-2">
        <SkeletonBase className="h-4 bg-gray-200 rounded w-full" />
        <SkeletonBase className="h-4 bg-gray-200 rounded w-5/6" />
        <SkeletonBase className="h-4 bg-gray-200 rounded w-2/3" />
      </div>

      {/* Price placeholder (only for selling items). */}
      {!isLostAndFound && (
        <SkeletonBase className="h-8 bg-gray-200 rounded w-24 mt-2" />
      )}

      {/* Lost & Found specific info placeholder. */}
      {isLostAndFound && (
        <div className="space-y-2">
          <SkeletonBase className="h-3 bg-gray-200 rounded w-48" />
          <SkeletonBase className="h-3 bg-gray-200 rounded w-36" />
        </div>
      )}

      {/* Metadata placeholder (e.g., category, poster, date). */}
      <div className="space-y-1 pt-2">
        <SkeletonBase className="h-3 bg-gray-200 rounded w-32" />
        <SkeletonBase className="h-3 bg-gray-200 rounded w-40" />
        <SkeletonBase className="h-3 bg-gray-200 rounded w-28" />
      </div>

      {/* Action buttons placeholder. */}
      <div className="mt-auto pt-4">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          {/* Contact button placeholder (conditional). */}
          {!isLostAndFound && (
            <SkeletonBase className="flex-1 h-10 bg-gray-200 rounded-lg" />
          )}
          {/* View Details button placeholder. */}
          <SkeletonBase className="flex-1 h-10 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

// Skeleton for a grid of Item Cards.
export const ItemCardGridSkeleton = ({
  count = 8, // Default number of skeleton cards to render.
  isLostAndFound = false,
  className = "",
}) => (
  <div
    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
  >
    {Array.from({ length: count }).map((_, index) => (
      <ItemCardSkeleton key={index} isLostAndFound={isLostAndFound} />
    ))}
  </div>
);

// Skeleton for a list item, often used in user-specific item lists (e.g., "My Items for Sale").
export const ListItemSkeleton = ({ className = "" }) => (
  <div
    className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col ${className}`}
  >
    <SkeletonBase className="w-full h-56 bg-gray-200" /> {/* Image part */}
    <div className="p-5 space-y-3">
      {" "}
      {/* Content part */}
      <SkeletonBase className="h-6 bg-gray-200 rounded w-3/4" /> {/* Title */}
      <div className="space-y-2">
        {" "}
        {/* Description lines */}
        <SkeletonBase className="h-4 bg-gray-200 rounded w-full" />
        <SkeletonBase className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
      <SkeletonBase className="h-8 bg-gray-200 rounded w-24" />{" "}
      {/* Price/Info */}
    </div>
    {/* Edit/Delete buttons placeholder. */}
    <div className="p-3 bg-gray-50 border-t flex space-x-2">
      <SkeletonBase className="flex-1 h-8 bg-gray-200 rounded-md" />
      <SkeletonBase className="flex-1 h-8 bg-gray-200 rounded-md" />
    </div>
  </div>
);

// Skeleton for a search and filter bar area.
export const SearchFilterSkeleton = ({ className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SkeletonBase className="h-12 bg-gray-200 rounded-lg" />{" "}
      {/* Search input */}
      <SkeletonBase className="h-12 bg-gray-200 rounded-lg" />{" "}
      {/* Filter dropdown 1 */}
      <SkeletonBase className="h-12 bg-gray-200 rounded-lg" />{" "}
      {/* Filter dropdown 2 */}
    </div>
  </div>
);

// Skeleton for an authentication form (login/signup).
export const AuthFormSkeleton = ({ className = "" }) => (
  <div className={`bg-white p-8 sm:p-10 rounded-xl shadow-2xl ${className}`}>
    {/* Header part */}
    <div className="text-center mb-6">
      <SkeletonBase className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3" />{" "}
      {/* Logo/Icon */}
      <SkeletonBase className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2" />{" "}
      {/* Title */}
      <SkeletonBase className="h-4 bg-gray-200 rounded w-32 mx-auto" />{" "}
      {/* Subtitle */}
    </div>

    {/* Form fields */}
    <div className="space-y-5">
      <div>
        {" "}
        {/* Email field */}
        <SkeletonBase className="h-4 bg-gray-200 rounded w-24 mb-2" />{" "}
        {/* Label */}
        <SkeletonBase className="h-12 bg-gray-200 rounded-lg w-full" />{" "}
        {/* Input */}
      </div>
      <div>
        {" "}
        {/* Password field */}
        <SkeletonBase className="h-4 bg-gray-200 rounded w-20 mb-2" />{" "}
        {/* Label */}
        <SkeletonBase className="h-12 bg-gray-200 rounded-lg w-full" />{" "}
        {/* Input */}
      </div>
      <SkeletonBase className="h-12 bg-gray-200 rounded-lg w-full" />{" "}
      {/* Submit button */}
      {/* "Or continue with" separator */}
      <div className="flex items-center my-6">
        <SkeletonBase className="flex-grow h-px bg-gray-200" />
        <SkeletonBase className="h-4 bg-gray-200 rounded w-32 mx-3" />
        <SkeletonBase className="flex-grow h-px bg-gray-200" />
      </div>
      <SkeletonBase className="h-12 bg-gray-200 rounded-lg w-full" />{" "}
      {/* Social login button */}
    </div>
  </div>
);

// Skeleton for the main application header.
export const HeaderSkeleton = ({ className = "" }) => (
  <nav className={`bg-white shadow-md ${className}`}>
    <div className="container mx-auto px-2 sm:px-4">
      <div className="flex items-center justify-between h-16 sm:h-20">
        {/* Logo placeholder. */}
        <div className="flex items-center">
          <SkeletonBase className="w-7 h-7 bg-gray-200 rounded mr-2" />
          <SkeletonBase className="h-6 bg-gray-200 rounded w-24" />
        </div>

        {/* Desktop navigation links placeholder. */}
        <div className="hidden md:flex items-center space-x-4">
          <SkeletonBase className="h-10 bg-gray-200 rounded w-16" />
          <SkeletonBase className="h-10 bg-gray-200 rounded w-16" />
          <SkeletonBase className="h-10 bg-gray-200 rounded w-24" />
        </div>

        {/* User action (login/profile) placeholder. */}
        <SkeletonBase className="h-8 bg-gray-200 rounded w-20" />
      </div>
    </div>
  </nav>
);

// Skeleton for a generic section header (e.g., "Your Items", "Lost & Found").
export const SectionHeaderSkeleton = ({ className = "" }) => (
  <div
    className={`flex flex-col sm:flex-row justify-between items-center mb-8 gap-3 ${className}`}
  >
    <SkeletonBase className="h-8 bg-gray-200 rounded w-48" /> {/* Title */}
    <SkeletonBase className="h-10 bg-gray-200 rounded w-32" />{" "}
    {/* Action button (e.g., "Add Item") */}
  </div>
);

// Skeleton for an EmptyState component.
export const EmptyStateSkeleton = ({ className = "" }) => (
  <div className={`text-center py-16 px-4 ${className}`}>
    <SkeletonBase className="w-16 h-16 bg-gray-200 rounded mx-auto mb-4" />{" "}
    {/* Icon */}
    <SkeletonBase className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2" />{" "}
    {/* Title */}
    <SkeletonBase className="h-4 bg-gray-200 rounded w-64 mx-auto mb-6" />{" "}
    {/* Description */}
    <SkeletonBase className="h-12 bg-gray-200 rounded w-40 mx-auto" />{" "}
    {/* Action button */}
  </div>
);

// Skeleton for a Modal component.
export const ModalSkeleton = ({ className = "" }) => (
  // This represents the modal backdrop and container.
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
    <div
      className={`bg-white p-6 rounded-lg shadow-xl w-full max-w-md ${className}`}
    >
      {/* Modal header skeleton. */}
      <div className="flex justify-between items-center mb-4">
        <SkeletonBase className="h-6 bg-gray-200 rounded w-32" /> {/* Title */}
        <SkeletonBase className="w-6 h-6 bg-gray-200 rounded" />{" "}
        {/* Close button */}
      </div>
      {/* Modal body content skeleton. */}
      <div className="space-y-4">
        <SkeletonBase className="h-12 bg-gray-200 rounded w-full" />
        <SkeletonBase className="h-24 bg-gray-200 rounded w-full" />
        <SkeletonBase className="h-12 bg-gray-200 rounded w-full" />
        <SkeletonBase className="h-12 bg-gray-200 rounded w-full" />
      </div>
    </div>
  </div>
);

// A composite skeleton loader for an entire page, varying by `type`.
export const PageLoadingSkeleton = ({
  type = "buying", // Default page type. Others: "selling", "lostfound", "auth".
  className = "",
}) => {
  switch (type) {
    case "selling": // Skeleton for the "My Items for Sale" page.
      return (
        <div className={`container mx-auto px-4 py-8 ${className}`}>
          <SectionHeaderSkeleton />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map(
              (
                _,
                index // Renders 6 list item skeletons.
              ) => (
                <ListItemSkeleton key={index} />
              )
            )}
          </div>
        </div>
      );

    case "lostfound": // Skeleton for the "Lost & Found" page.
      return (
        <div className={`container mx-auto px-4 py-8 ${className}`}>
          <SectionHeaderSkeleton />
          <SearchFilterSkeleton className="mb-8" />
          <ItemCardGridSkeleton count={8} isLostAndFound={true} />{" "}
          {/* Renders 8 L&F card skeletons. */}
        </div>
      );

    case "auth": // Skeleton for the authentication page.
      return (
        <div
          className={`min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 ${className}`}
        >
          <div className="max-w-4xl w-full md:grid md:grid-cols-2 md:gap-16 md:items-center">
            {/* Left side (branding) skeleton, hidden on smaller screens. */}
            <div className="hidden md:block">
              <EmptyStateSkeleton />{" "}
              {/* Or a more specific auth branding skeleton. */}
            </div>
            {/* Right side (form) skeleton. */}
            <AuthFormSkeleton />
          </div>
        </div>
      );

    case "buying": // Skeleton for the main item Browse/buying page.
    default:
      return (
        <div className={`container mx-auto px-4 py-8 ${className}`}>
          {/* Page title area skeleton. */}
          <div className="text-center mb-8">
            <SkeletonBase className="h-10 bg-gray-200 rounded w-64 mx-auto mb-2" />
            <SkeletonBase className="h-4 bg-gray-200 rounded w-48 mx-auto" />
          </div>
          <SearchFilterSkeleton className="mb-8" />
          <ItemCardGridSkeleton count={12} />{" "}
          {/* Renders 12 item card skeletons. */}
        </div>
      );
  }
};

// Export all skeleton components for use throughout the application.
// PageLoadingSkeleton is also exported as the default for convenience.
export default PageLoadingSkeleton;
