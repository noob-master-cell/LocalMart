import React from "react";
import { Link } from "react-router-dom";

/**
 * @component NotFound
 * @description A component displayed when a route is not found (404 error).
 * It provides a message and a link to navigate back to the home page.
 *
 * @returns {JSX.Element} The 404 Not Found page content.
 */
const NotFound = () => (
  <div className="container mx-auto text-center py-20 px-4">
    <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
    <h2 className="text-3xl font-semibold text-gray-800 mb-6">
      Page Not Found
    </h2>
    <p className="text-lg text-gray-600 mb-8">
      Oops! The page you are looking for does not exist. It might have been
      moved or deleted.
    </p>
    <Link
      to="/" // Link to the home page
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out"
    >
      Go Back Home
    </Link>
  </div>
);

export default NotFound;
