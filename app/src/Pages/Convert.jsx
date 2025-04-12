import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyA2XQn7HP9NpvcB_1vkxGcZ1-0UgUK4fMk");

const System = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
      setError(null);

      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls]);
    }
  };

  const processFilesInBatches = async (files, batchSize = 50) => {
    const results = [];
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (file) => {
          try {
            const base64Image = await toBase64(file);
            const imageBase64 = base64Image.split(",")[1];

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

            const result = await model.generateContent({
              contents: [
                {
                  parts: [
                    {
                      text: "Generate a vivid and engaging 50-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people. Use expressive and descriptive language suitable for product listings, blogs, or social media. Avoid generic phrases. Highlight what makes the image unique.",
                    },
                    {
                      inlineData: {
                        mimeType: file.type,
                        data: imageBase64,
                      },
                    },
                  ],
                },
              ],
            });

            return {
              fileName: file.name,
              description:
                result.response.candidates?.[0]?.content?.parts?.[0]?.text ||
                "No description found.",
            };
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            return {
              fileName: file.name,
              description: `Error: Could not generate description for this image.`,
            };
          }
        })
      );
      results.push(...batchResults);

      // Add a small delay between batches to prevent rate limiting
      if (i + batchSize < files.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    return results;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFiles.length) {
      setError("Please select at least one image file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDescriptions([]);

    try {
      const results = await processFilesInBatches(selectedFiles);
      setDescriptions(results);
    } catch (err) {
      console.error("Gemini SDK Error:", err);
      setError("An error occurred while generating the descriptions.");
    } finally {
      setIsLoading(false);
    }
  };

  const escapeCSV = (text) => {
    if (!text) return "";
    return `"${text.replace(/"/g, '""')}"`;
  };

  const handleDownload = (description, index) => {
    const header = `File Name,Description\n`;
    const row = `${escapeCSV(description.fileName)}\n${escapeCSV(
      description.description
    )}`;
    const csvContent = `${header}${row}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `description-${index + 1}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    if (!descriptions.length) return;

    const header = ["File Name", "Description"];
    const rows = descriptions.map((desc) => {
      const fileName = desc.fileName.replace(/"/g, '""');
      const description = desc.description
        .replace(/"/g, '""')
        .replace(/\n/g, " ");
      return `"${fileName}"\n"${description}"`;
    });

    const csvContent = `\uFEFF${header.join(",")}\n${rows.join("\n\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `all-descriptions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          AI Bulk Image Description Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
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

          <button
            type="submit"
            disabled={isLoading || !selectedFiles.length}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full
                     hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transform transition duration-300 ease-in-out hover:scale-105
                     shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </div>
            ) : (
              "Generate Descriptions"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 rounded-r-lg">
            <p className="text-red-700 font-medium">Error: {error}</p>
          </div>
        )}

        {previewUrls.length > 0 && (
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
                              ${
                                isLoading ? "opacity-50 blur-sm" : "opacity-100"
                              }
                              group-hover:shadow-xl`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Generated Descriptions
            </h2>
            {descriptions.length > 0 && (
              <button
                onClick={handleDownloadAll}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full
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
                Download All
              </button>
            )}
          </div>
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
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold mb-2">
                      Image {index + 1} - {desc.fileName}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {desc.description}
                    </p>
                    <button
                      onClick={() => handleDownload(desc, index)}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-full
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
                      Download Description
                    </button>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && !descriptions.length && !error && (
              <p className="text-gray-500 text-center italic">
                Upload images and click "Generate Descriptions" to start
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default System;