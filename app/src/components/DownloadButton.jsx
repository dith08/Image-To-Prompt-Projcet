import React from "react";

const DownloadButton = ({ onClick, children }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full
               hover:opacity-90 transform transition duration-300 ease-in-out hover:scale-105
               shadow-lg hover:shadow-xl flex items-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      {children}
    </button>
  );
};

export default DownloadButton;