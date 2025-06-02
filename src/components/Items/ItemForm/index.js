/**
 * @fileoverview Barrel file for the ItemForm component.
 * This file exports the main ItemForm component for creating or editing items.
 */

import ItemForm from "./ItemForm"; // Assuming ItemForm.jsx exports the main form component

// Default export is the main ItemForm component.
export default ItemForm;

// If ItemForm had sub-components like ItemFormFields or ItemFormActions
// that needed to be directly importable, they could be exported here as named exports.
// Example:
// export { default as ItemFormFields } from './ItemFormFields';
// export { default as ItemFormActions } from './ItemFormActions';
