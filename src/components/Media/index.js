/**
 * @fileoverview Barrel file for Media components.
 * This file re-exports media-related components, such as the ImageViewer,
 * for streamlined imports elsewhere in the application.
 */

import ImageViewer from "./ImageViewer/ImageViewer";

export {
  /**
   * Component for viewing images, potentially with zoom, carousel, and thumbnail features.
   * @see ImageViewer
   */
  ImageViewer,
};
