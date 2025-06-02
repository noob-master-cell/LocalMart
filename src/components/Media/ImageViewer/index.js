/**
 * @fileoverview Barrel file for the ImageViewer component and its potential sub-components.
 * This primarily exports the main ImageViewer component for convenient imports.
 */

import ImageViewer from "./ImageViewer";

// Default export is the main ImageViewer component.
export default ImageViewer;

// Optional: If sub-components like ImageDisplay (from ImageModal.jsx) or ThumbnailList
// were ever needed to be imported directly by other modules,
// they could be exported as named exports here.
// Example:
// export { default as ImageDisplay } from './ImageModal';
// export { default as ThumbnailList } from './ThumbnailList';
