/**
 * @fileoverview Barrel file for components related to items.
 * This includes components for displaying item cards, forms for item creation/editing,
 * Q&A sections for items, and detailed item modals.
 */

import ItemCard from "./ItemCard/ItemCard";
import ItemForm from "./ItemForm/ItemForm";
import ItemQuestions from "./ItemQuestions/ItemQuestions";
import ItemDetailModal from "./ItemDetailModal/ItemDetailModal";

export {
  /**
   * Component for displaying a summary of an item in a card format.
   * @see ItemCard
   */
  ItemCard,
  /**
   * Form component for creating or editing items.
   * @see ItemForm
   */
  ItemForm,
  /**
   * Component for displaying and managing questions and answers related to an item.
   * @see ItemQuestions
   */
  ItemQuestions,
  /**
   * Modal component to show detailed information about an item.
   * @see ItemDetailModal
   */
  ItemDetailModal,
};
