import React from "react";

const ErrorMessage = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 rounded-r-lg">
      <p className="text-red-700 font-medium">Error: {error}</p>
    </div>
  );
};

export default ErrorMessage;