import React from "react";
import DescriptionItem from "./DescriptionItem";

const DescriptionsList = ({ descriptions, isLoading, onDownload }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Generated Descriptions
      </h2>
      <div className="bg-white rounded-xl shadow-inner p-6">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 animate-pulse">
              Generating descriptions...
            </p>
          </div>
        )}
        {!isLoading && descriptions.length > 0 && (
          <div className="space-y-4">
            {descriptions.map((desc, index) => (
              <DescriptionItem 
                key={index} 
                description={desc} 
                index={index} 
                onDownload={onDownload} 
              />
            ))}
          </div>
        )}
        {!isLoading && !descriptions.length && (
          <p className="text-gray-500 text-center italic">
            Upload images and click "Generate Descriptions" to start
          </p>
        )}
      </div>
    </div>
  );
};

export default DescriptionsList;