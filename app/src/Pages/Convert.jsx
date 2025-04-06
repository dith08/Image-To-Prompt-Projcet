import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyD-49kCODEEYvaC2D6qj7_pVLJXXRUvOdg");

const System = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setDescription("");
      setError(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      setDescription("");
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please select an image file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDescription("");

    try {
      const base64Image = await toBase64(selectedFile);
      const imageBase64 = base64Image.split(",")[1];

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const result = await model.generateContent({
        contents: [
          {
            parts: [
              {
                text: "Deskripsikan Tentang Gambar ini",
              },
              {
                inlineData: {
                  mimeType: selectedFile.type,
                  data: imageBase64,
                },
              },
            ],
          },
        ],
      });

      const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
      setDescription(text || "No description found.");
    } catch (err) {
      console.error("Gemini SDK Error:", err);
      setError("An error occurred while generating the description.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([description], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFile ? `${selectedFile.name.split(".")[0]}-description.txt` : "description.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto max-w-2xl p-6 bg-white rounded-lg shadow-md mt-10 text-center font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Image Description Generator</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <label htmlFor="imageFile" className="block text-lg font-medium text-gray-700 mb-2">
          Choose an image:
        </label>
        <input
          type="file"
          id="imageFile"
          name="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
          className="block w-full text-sm text-gray-500 mb-4
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={isLoading || !selectedFile}
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 
                3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : null}
          {isLoading ? "Processing..." : "Get Description"}
        </button>
      </form>

      {error && <p className="text-red-600 font-semibold mt-4 p-3 bg-red-100 rounded-md">Error: {error}</p>}

      {previewUrl && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">Preview:</h2>
          <img
            id="imagePreview"
            src={previewUrl}
            alt="Selected preview"
            className={`max-w-full max-h-96 mx-auto border border-gray-300 rounded-md shadow-sm transition-opacity duration-300 ease-in-out ${isLoading ? "opacity-50" : "opacity-100"}`}
          />
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-700">Description:</h2>
        <div id="result" className="p-4 bg-gray-100 border border-gray-200 rounded-md min-h-[60px] text-left text-gray-800">
          {isLoading && <p className="text-gray-500 italic">Loading description...</p>}
          {!isLoading && description && <p>{description}</p>}
          {!isLoading && !description && !error && <p className="text-gray-500">Upload an image and click "Get Description".</p>}
        </div>
        {!isLoading && description && (
          <button onClick={handleDownload} className="mt-4 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition">
            Download as .txt
          </button>
        )}
      </div>
    </div>
  );
};

export default System;
