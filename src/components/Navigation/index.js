/**
 * @fileoverview Barrel file for Navigation components.
 * This file re-exports navigation-related components for easier imports.
 */

import MobileNavigation from "./MobileNavigation/MobileNavigation";
import NavLinkRouter from "./NavLinkRouter";
import NotFound from "./NotFound";

export {
  /**
   * Navigation bar specifically designed for mobile views.
   * @see MobileNavigation
   */
  MobileNavigation,
  /**
   * A custom NavLink component integrated with React Router for navigation.
   * @see NavLinkRouter
   */
  NavLinkRouter,
  /**
   * Component displayed for 404 Not Found routes.
   * @see NotFound
   */
  NotFound,
};
