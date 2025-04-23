import React from "react";
import DownloadButton from "./DownloadButton";

const DescriptionItem = ({ description, index, onDownload }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Image: {description.fileName}
          </p>
          <p className="text-gray-800 whitespace-pre-wrap">{description.description}</p>
        </div>
        <div className="ml-4">
          <DownloadButton onClick={() => onDownload(description, index)}>
            Save
          </DownloadButton>
        </div>
      </div>
    </div>
  );
};

export default DescriptionItem;