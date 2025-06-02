/**
 * @fileoverview Barrel file for Filter components.
 * This file re-exports various filter components, such as CompactFilterBar and SearchAndFilter,
 * to simplify their importation in other parts of the application.
 */

// Import specific filter components from their respective directories.
// CompactFilterBar: A compact filter UI, possibly for mobile or less complex filtering.
import CompactFilterBar from "./CompactFilterBar/CompactFilterBar";
// SearchAndFilter: A more comprehensive component combining search input with filter options.
import SearchAndFilter from "./SearchAndFilter/SearchAndFilter";

// Export the imported components for use elsewhere.
export { CompactFilterBar, SearchAndFilter };
