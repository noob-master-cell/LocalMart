/**
 * @fileoverview Barrel file for Layout components.
 * This file re-exports common layout components like Header and Footer
 * for simpler imports elsewhere in the application.
 */

import Header from "./Header";
import Footer from "./Footer";

export {
  /**
   * The main application header/navigation bar.
   * @see Header
   */
  Header,
  /**
   * The application footer.
   * @see Footer
   */
  Footer,
};
