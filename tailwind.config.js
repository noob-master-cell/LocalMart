// This is the configuration file for Tailwind CSS.
// It allows customization of Tailwind's default settings, such as theme, plugins, and content sources.

/** @type {import('tailwindcss').Config} */
// The `module.exports` syntax is used because this is a CommonJS module,
// which is standard for Node.js configuration files.
module.exports = {
  // The `content` array specifies the files Tailwind should scan to find utility classes.
  // This ensures that only the CSS classes used in your project are included in the final build,
  // optimizing the file size.
  content: [
    // Scan all .js, .jsx, .ts, and .tsx files within the 'src' directory and its subdirectories.
    // This line is crucial for Tailwind to correctly identify and include the necessary styles.
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // The `theme` object is where you customize Tailwind's default design system.
  // You can extend or override aspects like colors, fonts, spacing, breakpoints, etc.
  theme: {
    // The `extend` key allows you to add new values to the default theme
    // without completely overriding the existing ones.
    extend: {},
  },
  // The `plugins` array is where you can register additional Tailwind CSS plugins.
  // Plugins can add new utilities, components, or variants.
  plugins: [],
};
