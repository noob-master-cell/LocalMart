// This file serves as a central export point for all custom hooks in the `hooks` directory.
// This allows for cleaner and more organized imports of hooks in other parts of the application.
// Instead of importing each hook from its specific file, components can import them from `../hooks`.

// Example: import { useDebounce, useLocalStorage } from '../hooks';

export { useDebounce } from "./useDebounce";
export { useIntersectionObserver } from "./useIntersectionObserver";
export { useLocalStorage } from "./useLocalStorage";
export { useAuth } from "./useAuth.jsx"; // Assuming useAuth.jsx is also a general hook
export { useItemFiltering } from "./useItemFiltering";
export { useImageLazyLoad } from "./useImageLazyLoad";
export { usePerformanceMonitor } from "./usePerformanceMonitor";
export {
  usePerformanceOptimizations,
  useFirebaseConnections,
} from "./usePerformanceOptimizations";
export { useVirtualScroll } from "./useVirtualScroll";
