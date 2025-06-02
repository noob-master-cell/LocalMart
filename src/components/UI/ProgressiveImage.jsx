// project/src/components/UI/ProgressiveImage.jsx
import React, { useState, memo, useEffect } from "react";
import ShoppingBagIcon from "../Icons/ShoppingBagIcon"; // Path: components/Icons/ShoppingBagIcon.jsx
import { getPlaceholderImage } from "../../utils/helpers"; // Path: project/src/utils/helpers.js

const ProgressiveImage = memo(({ src, alt, className, onClick, itemName }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setImageSrc(null);

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    img.src = src;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (hasError) {
    return (
      <div
        className={`${className} bg-gray-100 flex items-center justify-center`}
        onClick={onClick}
      >
        <ShoppingBagIcon className="w-16 h-16 text-gray-400" />
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`${className} bg-gray-200 animate-pulse`} />
      )}
      <img
        src={imageSrc || getPlaceholderImage(itemName || "Loading...")}
        alt={alt}
        className={`${className} ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
        onClick={onClick}
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = getPlaceholderImage(itemName || "No Image");
        }}
      />
    </>
  );
});
ProgressiveImage.displayName = "ProgressiveImage";
export default ProgressiveImage;
