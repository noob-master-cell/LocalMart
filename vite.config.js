// Import the defineConfig function from Vite to provide type-checking and autocompletion for the configuration.
import { defineConfig } from "vite";
// Import the React plugin for Vite to enable React-specific transformations (e.g., JSX, Fast Refresh).
import react from "@vitejs/plugin-react";

// Vite configuration object.
// See https://vitejs.dev/config/ for more options.
export default defineConfig({
  // An array of plugins to use.
  plugins: [
    // The React plugin enables support for React, including JSX and Fast Refresh.
    react(),
  ],
});
