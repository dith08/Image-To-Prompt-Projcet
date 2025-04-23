import React from "react";

const ImagePreviews = ({ previewUrls, isLoading }) => {
  if (!previewUrls.length) return null;
  
  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-xl shadow-inner">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Image Previews
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {previewUrls.map((url, index) => (
          <div key={index} className="relative group">
            <img
              src={url}
              alt={`Preview ${index + 1}`}
              className={`w-full h-48 object-cover rounded-lg shadow-md transition-all duration-300 
                        ${isLoading ? "opacity-50 blur-sm" : "opacity-100"}
                        group-hover:shadow-xl`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagePreviews;