// src/pages/authPage/components/AuthBranding.jsx

import React from "react";
// Assuming HomeIcon is in your shared components/icons directory
import HomeIcon from "../../../components/icons/HomeIcon";

const AuthBranding = ({ isSignupMode }) => {
  // isSignupMode can customize messages
  return (
    <div className="hidden md:flex flex-col items-center justify-center text-center p-8">
      <HomeIcon className="w-24 h-24 text-indigo-600 mb-6" />
      <h1 className="text-5xl font-extrabold text-gray-900">LocalMart</h1>
      <p className="mt-4 text-xl text-gray-600">
        Your Community Marketplace & Lost & Found Hub.
      </p>
      <p className="mt-2 text-md text-gray-500">
        {isSignupMode
          ? "Create an account to start buying, selling, and helping your neighbors!"
          : "Sign in to access your account and continue exploring."}
      </p>
    </div>
  );
};

export default AuthBranding;
