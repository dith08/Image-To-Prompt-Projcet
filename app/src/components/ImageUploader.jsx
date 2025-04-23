import React from "react";

const ImageUploader = ({ isLoading, handleFileChange, selectedFiles }) => {
  return (
    <div className="relative group flex-1">
      <label
        htmlFor="imageFile"
        className="block text-lg font-medium text-gray-700 mb-2"
      >
        Upload Your Images
      </label>
      <input
        type="file"
        id="imageFile"
        name="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isLoading}
        multiple
        className="block w-full text-sm text-gray-500 
                 file:mr-4 file:py-3 file:px-6
                 file:rounded-full file:border-0
                 file:text-sm file:font-semibold
                 file:bg-gradient-to-r file:from-blue-500 file:to-purple-500 file:text-white
                 hover:file:opacity-90
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition duration-300 ease-in-out"
      />
    </div>
  );
};
export default ImageUploader;