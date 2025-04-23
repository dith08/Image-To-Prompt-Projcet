import React, { useState, useEffect } from "react";
import ImageUploader from "./components/ImageUploader";
import DownloadButton from "./components/DownloadButton";
import SubmitButton from "./components/SubmitButton";
import ErrorMessage from "./components/ErrorMessage";
import ImagePreviews from "./components/ImagePreviews";
import DescriptionsList from "./components/DescriptionList";
import PromptSelector from "./components/PromptSelector";
import { processFilesInBatches } from "./services/AiServices";
import { escapeCSV } from "./utils/ImageUtils";

const App = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState("words15");
  const [customPrompt, setCustomPrompt] = useState("");

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length) {
      if (files.length > 1000) {
        setError("Maximum 1000 files can be processed at once");
        return;
      }
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
      setError(null);

      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFiles.length) {
      setError("Please select at least one image file.");
      return;
    }

    if (selectedFiles.length > 1000) {
      setError("Maximum 1000 files can be processed at once");
      return;
    }

    // Validate that a custom prompt is provided if that option is selected
    if (selectedPrompt === "custom" && !customPrompt.trim()) {
      setError("Please enter a custom prompt or select a predefined one.");
      return;
    }

    if (!selectedPrompt) {
      setError("Please select a prompt type.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDescriptions([]);

    try {
      const results = await processFilesInBatches(selectedFiles, selectedPrompt, customPrompt);
      setDescriptions(results);
    } catch (err) {
      console.error("Gemini SDK Error:", err);
      setError("An error occurred while generating the descriptions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (description, index) => {
    const header = `prompt\n`;
    const row = `${escapeCSV(description.description)}`;
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

    const header = ["prompt"];
    const rows = descriptions.map((desc) => {
      const description = desc.description
        .replace(/"/g, '""')
        .replace(/\n/g, " ");
      return `"${description}"`;
    });

    const csvContent = `\uFEFF${header.join("\n")}\n${rows.join("\n\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompts.csv`;
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
          <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
            <PromptSelector
              selectedPrompt={selectedPrompt}
              setSelectedPrompt={setSelectedPrompt}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <ImageUploader 
              isLoading={isLoading} 
              handleFileChange={handleFileChange} 
              selectedFiles={selectedFiles} 
            />
            
            {descriptions.length > 0 && (
              <DownloadButton onClick={handleDownloadAll} className="self-end">
                Download All
              </DownloadButton>
            )}
          </div>

          <SubmitButton 
            isLoading={isLoading} 
            disabled={isLoading || !selectedFiles.length || !selectedPrompt || (selectedPrompt === "custom" && !customPrompt.trim())} 
          />
        </form>

        <ErrorMessage error={error} />
        <ImagePreviews previewUrls={previewUrls} isLoading={isLoading} />
        <DescriptionsList 
          descriptions={descriptions} 
          isLoading={isLoading} 
          onDownload={handleDownload} 
        />
      </div>
    </div>
  );
};

export default App;