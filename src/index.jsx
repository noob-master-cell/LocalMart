// This is the main entry point for the React application.
// It renders the root component (`AppWrapper`) into the DOM.

import React from "react";
import ReactDOM from "react-dom/client"; // Import for React 18 createRoot API.
import "./index.css"; // Import global styles, including Tailwind CSS.
import AppWrapper from "./AppWrapper.jsx"; // The main application wrapper component.

// Get the root DOM element where the React application will be mounted.
// This element is typically a <div> with id="root" in `index.html`.
const rootElement = document.getElementById("root");

// Create a React root using the new ReactDOM.createRoot API (for React 18+).
const root = ReactDOM.createRoot(rootElement);

// Render the main application component (`AppWrapper`) into the root.
// React.StrictMode is a wrapper that helps identify potential problems in an application.
// It activates additional checks and warnings for its descendants in development mode.
root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
