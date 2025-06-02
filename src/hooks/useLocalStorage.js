// This custom React hook provides a way to persist state to `localStorage`
// and synchronize it with React component state. It mimics the `useState` hook's API.

import { useState, useEffect } from "react";

/**
 * `useLocalStorage` hook.
 * Persists state to localStorage and syncs it with a React state variable.
 *
 * @param {string} key - The key under which the value will be stored in localStorage.
 * @param {any} initialValue - The initial value to use if no value is found in localStorage
 * or if localStorage is not available.
 * @returns {[any, Function]} A tuple containing the current state value and a function to update it.
 * Similar to `useState`.
 */
export const useLocalStorage = (key, initialValue) => {
  // Initialize state:
  // Try to get the stored value from localStorage.
  // If it exists, parse it (assuming it's stored as JSON).
  // If it doesn't exist or an error occurs (e.g., localStorage not available), use `initialValue`.
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Check if `window` is defined (for environments like SSR where localStorage isn't available).
      if (typeof window === "undefined") {
        return initialValue;
      }
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Log error and fallback to initialValue if localStorage access fails.
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * A wrapped version of useState's setter function that also persists the new value
   * to localStorage.
   * @param {any | Function} value - The new value for the state, or a function that returns the new value.
   */
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState.
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Update React state.
      setStoredValue(valueToStore);
      // Persist to localStorage.
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Log error if persisting to localStorage fails.
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Optional: Effect to listen for changes to the same localStorage key from other tabs/windows.
  // This is an advanced feature and can be omitted if not needed.
  // useEffect(() => {
  //   if (typeof window === 'undefined') return;
  //
  //   const handleStorageChange = (event) => {
  //     if (event.key === key) {
  //       try {
  //         setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
  //       } catch (error) {
  //         console.warn(`Error parsing storage event for key "${key}":`, error);
  //         setStoredValue(initialValue);
  //       }
  //     }
  //   };
  //
  //   window.addEventListener('storage', handleStorageChange);
  //   return () => window.removeEventListener('storage', handleStorageChange);
  // }, [key, initialValue]);

  return [storedValue, setValue];
};
