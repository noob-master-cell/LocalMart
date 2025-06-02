import React from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * @component NavLinkRouter
 * @description A navigation link component that integrates with React Router.
 * It highlights itself as active based on the current route.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} props.to - The path to navigate to.
 * @param {string} props.label - The text label for the link.
 * @param {React.ReactNode} props.icon - The icon element to display within the link.
 * @param {boolean} [props.isAuthTrigger=false] - If true, the link is considered active if the current path starts with '/auth'.
 * @returns {JSX.Element} A React Router Link styled as a navigation item.
 */
const NavLinkRouter = ({ to, label, icon, isAuthTrigger = false }) => {
  const location = useLocation();

  // Determine if the link is active.
  // For auth triggers, active if the path starts with '/auth'.
  // For other links, active if the path exactly matches 'to'.
  const isActive = isAuthTrigger
    ? location.pathname.startsWith("/auth")
    : location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center px-2 py-1 sm:px-3 sm:py-2 rounded-md text-sm font-medium w-full sm:w-auto transition-colors
                        ${
                          isActive
                            ? "text-indigo-600 bg-indigo-50" // Active styles
                            : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50" // Inactive styles
                        }`}
      aria-current={isActive ? "page" : undefined} // Accessibility for active link
    >
      {icon}
      <span className="mt-0.5 text-xs sm:text-sm">{label}</span>
    </Link>
  );
};

export default NavLinkRouter;
