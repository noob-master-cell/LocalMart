// This custom React hook implements debouncing for a value.
// Debouncing delays updating the `debouncedValue` until a certain amount of time
// has passed without the original `value` changing. This is useful for scenarios
// like search input fields, where you want to trigger an API call only after the user
// has stopped typing for a moment.

import { useState, useEffect } from "react";

/**
 * `useDebounce` hook.
 * Debounces a value, meaning it only updates after a specified delay
 * since the last change to the input value.
 *
 * @param {any} value - The value to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {any} The debounced value.
 */
export const useDebounce = (value, delay) => {
  // State to store the debounced value.
  const [debouncedValue, setDebouncedValue] = useState(value);

  // useEffect to handle the debouncing logic.
  // This effect runs whenever the `value` or `delay` changes.
  useEffect(() => {
    // Set up a timer (timeout) to update the `debouncedValue`
    // after the specified `delay`.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function: Clear the timeout if the `value` changes before the `delay` elapses,
    // or if the component unmounts. This prevents the `debouncedValue` from being updated
    // with an old `value` and avoids potential memory leaks.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Dependencies: re-run the effect if `value` or `delay` changes.

  // Return the debounced value.
  return debouncedValue;
};
