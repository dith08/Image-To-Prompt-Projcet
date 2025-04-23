import React from "react";

const DEFAULT_PROMPTS = [
  {
    id: "words5",
    name: "5 Words",
    text: "Generate a vivid and engaging 5-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people."
  },
  {
    id: "words7",
    name: "7 Words",
    text: "Generate a vivid and engaging 7-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people."
  },
  {
    id: "words9",
    name: "9 Words",
    text: "Generate a vivid and engaging 9-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people."
  },
  {
    id: "words11",
    name: "11 Words",
    text: "Generate a vivid and engaging 11-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people."
  },
  {
    id: "words13",
    name: "13 Words",
    text: "Generate a vivid and engaging 13-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people."
  },
  {
    id: "words15",
    name: "15 Words",
    text: "Generate a vivid and engaging 15-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people."
  },
  {
    id: "words17",
    name: "17 Words",
    text: "Generate a vivid and engaging 17-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people."
  },
  {
    id: "words19",
    name: "19 Words",
    text: "Generate a vivid and engaging 19-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people."
  },
  {
    id: "words21",
    name: "21 Words",
    text: "Generate a vivid and engaging 21-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people."
  },
{
  id: "words23",
  name: "23 Words",
  text: "Generate a vivid and engaging 23-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people."
},
  ];

const PromptSelector = ({ selectedPrompt, setSelectedPrompt, customPrompt, setCustomPrompt }) => {
  const handlePromptChange = (e) => {
    const promptId = e.target.value;
    if (promptId === "custom") {
      setSelectedPrompt("custom");
    } else {
      const prompt = DEFAULT_PROMPTS.find(p => p.id === promptId);
      setSelectedPrompt(prompt.id);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-700">Select Description Style</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DEFAULT_PROMPTS.map((prompt) => (
          <div key={prompt.id} className="flex items-center">
            <input
              type="radio"
              id={prompt.id}
              name="promptType"
              value={prompt.id}
              checked={selectedPrompt === prompt.id}
              onChange={handlePromptChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={prompt.id} className="ml-2 block text-sm text-gray-700">
              {prompt.name}
            </label>
          </div>
        ))}
        
        <div className="flex items-center">
          <input
            type="radio"
            id="custom"
            name="promptType"
            value="custom"
            checked={selectedPrompt === "custom"}
            onChange={handlePromptChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="custom" className="ml-2 block text-sm text-gray-700">
            Custom Prompt
          </label>
        </div>
      </div>
      
      {selectedPrompt === "custom" && (
        <div className="mt-3">
          <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700">
            Enter your custom prompt:
          </label>
          <textarea
            id="customPrompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Describe what you want the AI to generate for each image..."
          />
        </div>
      )}
      
      <div className="mt-3 p-3 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Current Prompt:</h4>
        <p className="text-xs text-gray-600">
          {selectedPrompt === "custom" 
            ? customPrompt || "Please enter a custom prompt" 
            : DEFAULT_PROMPTS.find(p => p.id === selectedPrompt)?.text || "Select a prompt type"}
        </p>
      </div>
    </div>
  );
};

export default PromptSelector;