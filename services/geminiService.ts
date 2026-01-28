
import { GoogleGenAI, Type } from "@google/genai";
import { RestorationAnalysis } from "../types";

export const analyzeRuin = async (base64Image: string): Promise<RestorationAnalysis> => {
  // Always use process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  const systemInstruction = `You are an Expert Architectural Historian and AI Restoration Specialist specializing in 14th-century Vijayanagara Empire architecture (Dravidian style). 
Your mission is to assist in the "Stone to Server: AI Restoration of Hampi" project.

Analyze the provided image of a Hampi ruin and provide:
1. Status Report: Describe the current state of the ruin, identifying missing elements like Gopurams, Mandapas, and ornate granite carvings.
2. Historical Context: Briefly explain the building's likely original function.
3. Restoration Blueprint: Technical details on how to "fix" the structure using historical Dravidian architectural standards.
4. AI Visualization Prompt: A detailed descriptive prompt (max 150 words) starting with "A high-quality, photorealistic architectural restoration of..." for an AI image generator. Focus on the majestic 14th-century Vijayanagara style with intact carvings, vibrant colors, and complete structures.

Return strictly valid JSON.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
        { text: "Analyze this Hampi ruin for historical restoration." }
      ]
    },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          statusReport: { type: Type.STRING },
          historicalContext: { type: Type.STRING },
          restorationBlueprint: { type: Type.STRING },
          aiVisualizationPrompt: { type: Type.STRING }
        },
        required: ["statusReport", "historicalContext", "restorationBlueprint", "aiVisualizationPrompt"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("The Sages returned no wisdom. Please try again.");
  return JSON.parse(text) as RestorationAnalysis;
};

export const generateRestorationImage = async (analysis: RestorationAnalysis): Promise<string> => {
  // Create a fresh instance right before making an API call to ensure it uses the latest API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    // Using Imagen 4.0 for more stable text-to-image generation as requested by the architectural task
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: analysis.aiVisualizationPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("The divine vision could not be manifested. Please check your project's image generation quota.");
    }

    const base64EncodeString: string = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64EncodeString}`;
  } catch (error: any) {
    console.error("Image generation failed:", error);
    // Explicitly check for unauthorized or non-existent entity errors which usually imply key/project issues
    if (error.message?.includes("entity was not found") || error.message?.includes("404")) {
      throw new Error("Architecture key not authorized. Please ensure a valid, billing-enabled API project is selected.");
    }
    throw error;
  }
};
