// This component renders the WhatsApp logo icon.
import React from "react";

/**
 * WhatsAppIcon component.
 * @returns {JSX.Element} The SVG icon for WhatsApp.
 */
const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24" // Defines the canvas size.
    fill="currentColor" // The fill color is inherited from the text color.
    className="w-5 h-5" // Default sizing using Tailwind CSS classes.
  >
    {/* Path data for the WhatsApp logo. */}
    <path d="M12.01,2.05C6.52,2.05,2.07,6.5,2.07,11.99c0,1.75,0.47,3.49,1.38,5.03l-1.4,5.13l5.25-1.37c1.48,0.81,3.16,1.24,4.71,1.24h0c5.48,0,9.94-4.45,9.94-9.93C21.95,6.5,17.49,2.05,12.01,2.05z M16.88,15.36c-0.23,0.56-0.9,1-1.58,1.08c-0.6,0.07-1.25,0.06-1.92-0.11c-1.03-0.26-2.38-0.89-3.82-2.23c-1.77-1.65-2.88-3.62-3.25-4.42c-0.22-0.47-0.04-0.92,0.15-1.23c0.19-0.29,0.42-0.41,0.62-0.41c0.2,0,0.38,0.01,0.53,0.02c0.23,0.02,0.4,0.03,0.56,0.32c0.2,0.34,0.7,1.69,0.76,1.82c0.06,0.13,0.09,0.28-0.04,0.49c-0.13,0.21-0.22,0.33-0.4,0.51c-0.18,0.18-0.37,0.37-0.55,0.59c-0.19,0.23-0.39,0.48-0.18,0.86c0.21,0.38,0.95,1.58,2.06,2.59c1.37,1.25,2.52,1.61,2.9,1.77c0.22,0.09,0.59,0.05,0.82-0.12c0.29-0.21,0.53-0.56,0.71-0.82c0.18-0.26,0.36-0.42,0.59-0.25c0.23,0.17,1.44,0.68,1.69,0.81c0.25,0.13,0.42,0.19,0.47,0.29C17.06,14.72,16.99,15.03,16.88,15.36z" />
  </svg>
);
export default WhatsAppIcon;
