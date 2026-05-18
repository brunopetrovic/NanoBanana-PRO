import { GoogleGenAI } from "@google/genai";
import { PromptState, ElementReference } from "../types";

// Construct the text prompt from the structured state
export const constructPrompt = (state: PromptState): string => {
  const segments = [];

  // Subject & Action
  if (state.subject) {
    let segment = `Subject: ${state.subject}`;
    if (state.action) segment += `, Action: ${state.action}`;
    if (state.environment) segment += `, Environment: ${state.environment}`;
    segments.push(segment);
  }

  // Camera & Technical
  const techSpecs = [];
  if (state.shotType) techSpecs.push(`Shot Type: ${state.shotType}`);
  if (state.angle) techSpecs.push(`Angle: ${state.angle}`);
  if (state.camera) techSpecs.push(`Camera: ${state.camera}`);
  if (state.lens) techSpecs.push(`Lens: ${state.lens}`);
  if (state.filmLook && state.filmLook !== 'None') techSpecs.push(`Film Look: ${state.filmLook}`);
  
  if (techSpecs.length > 0) {
    segments.push(`Camera Gear & Framing: ${techSpecs.join(', ')}`);
  }

  // Lighting & Mood
  const moodSpecs = [];
  if (state.lighting) moodSpecs.push(`Lighting: ${state.lighting}`);
  if (state.mood) moodSpecs.push(`Mood/Atmosphere: ${state.mood}`);
  if (moodSpecs.length > 0) {
    segments.push(`Lighting & Mood: ${moodSpecs.join(', ')}`);
  }

  // Style
  const styleSpecs = [];
  if (state.style) styleSpecs.push(`Art Style: ${state.style}`);
  if (state.movieLook && state.movieLook !== 'None') styleSpecs.push(`Aesthetic Reference: ${state.movieLook}`);
  if (state.effect && state.effect !== 'None') styleSpecs.push(`Post-Process Effect: ${state.effect}`);
  
  if (styleSpecs.length > 0) {
    segments.push(`Style & Aesthetics: ${styleSpecs.join(', ')}`);
  }

  segments.push("Quality: Masterpiece, 8k, highly detailed, professional photography, cinematic lighting, photorealistic.");

  return segments.join('. ');
};

let aiInstance: GoogleGenAI | null = null;
const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing. Please set process.env.GEMINI_API_KEY.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

// Helper function to turn file to base64 asynchronously
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const generateImage = async (
  prompt: string, 
  elements: ElementReference[] = []
): Promise<string> => {
  const ai = getAI();
  
  // Note: For gemini-3.0-pro-preview, we can mix text and images for editing or style transfer.
  const parts: any[] = [];
  
  // Prepare reference images concurrently to save generation time
  const filePromises = elements.map(async (element) => {
    if (element.base64) {
      const base64Data = element.base64.split(',')[1]; 
      return {
        inlineData: {
          mimeType: element.file?.type || 'image/jpeg',
          data: base64Data
        }
      };
    } else if (element.file) {
      const base64DataUrl = await fileToBase64(element.file);
      const base64Data = base64DataUrl.split(',')[1];
      return {
        inlineData: {
          mimeType: element.file.type || 'image/jpeg',
          data: base64Data
        }
      };
    }
    return null;
  });

  const resolvedParts = await Promise.all(filePromises);
  for (const part of resolvedParts) {
    if (part) parts.push(part);
  }

  // Add the text prompt
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
            aspectRatio: "16:9", // Cinematic default
            imageSize: "2K",    // High quality
        }
      },
    });

    // Extract image from response
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    // Fallback if no image found but text is returned (error message usually)
    if (response.text) {
        throw new Error(`Generation failed: ${response.text}`);
    }

    throw new Error("No image data returned from Gemini.");

  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};