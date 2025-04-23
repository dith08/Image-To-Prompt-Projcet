import { GoogleGenerativeAI } from "@google/generative-ai";
import { toBase64 } from "../utils/imageUtils";

const API_KEY = "AIzaSyA2XQn7HP9NpvcB_1vkxGcZ1-0UgUK4fMk";
const genAI = new GoogleGenerativeAI(API_KEY);

const DEFAULT_PROMPTS = {
  words5: "Generate a vivid and engaging 5-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people.",
  words7: "Generate a vivid and engaging 7-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people.",
  words9: "Generate a vivid and engaging 9-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people.",
  words11: "Generate a vivid and engaging 11-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people.",
  words13: "Generate a vivid and engaging 13-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people.",
  words15: "Generate a vivid and engaging 15-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people.",
  words17: "Generate a vivid and engaging 17-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people.",
  words19: "Generate a vivid and engaging 19-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people.",
  words21: "Generate a vivid and engaging 21-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people.",
  words23: "Generate a vivid and engaging 23-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people.",
  words50: "Generate a vivid and engaging 50-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people.",
  words100: "Generate a vivid and engaging 100-word description of the image below. Focus on key visual elements such as colors, lighting, mood, composition, and notable objects or people."
};

export const generateImageDescription = async (file, promptType, customPrompt) => {
  try {
    const base64Image = await toBase64(file);
    const imageBase64 = base64Image.split(",")[1];
    
    // Determine which prompt to use
    let promptText;
    if (promptType === "custom") {
      promptText = customPrompt;
    } else {
      promptText = DEFAULT_PROMPTS[promptType] || DEFAULT_PROMPTS.words15;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent({
      contents: [
        {
          parts: [
            { text: promptText },
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
};

export const processFilesInBatches = async (files, promptType, customPrompt, batchSize = 10) => {
  const results = [];
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(file => generateImageDescription(file, promptType, customPrompt))
    );
    
    results.push(...batchResults);

    // Add delay between batches to prevent rate limiting
    if (i + batchSize < files.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  return results;
};