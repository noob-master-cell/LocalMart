// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Access mode
  return {
    plugins: [react()],
    esbuild: {
      // Remove console.log and console.warn in production
      pure: mode === "production" ? ["console.log", "console.warn"] : [],
      // To drop all console statements in production:
      // drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  };
});
