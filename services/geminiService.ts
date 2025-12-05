// src/services/geminiService.ts
import { GoogleGenAI } from "@google/genai";
import { TattooStyle } from "../types";

// ✅ Use the billed key
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GOOGLE_API_KEY is not set in .env.local");
}

const ai = new GoogleGenAI({ apiKey });

export const generateTattooDesign = async (
  description: string,
  style: TattooStyle,
  placement: string
): Promise<string> => {
  const prompt = `
    High-quality tattoo concept.
    Style: ${style}.
    Subject: ${description}.
    Placement focus: ${placement}.
    Clear linework, strong contrast, stencil-friendly, on a plain background.
  `.trim();

  const response = await ai.models.generateImages({
    model: "imagen-4.0-generate-001",
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: "1:1",
      imageSize: "1K",
      personGeneration: "allow_adult",
    },
  });

  const first = response.generatedImages?.[0];

  if (!first?.image?.imageBytes) {
    console.error("Unexpected Imagen response:", response);
    throw new Error("No image bytes returned from Imagen");
  }

  const base64 = first.image.imageBytes;
  return `data:image/png;base64,${base64}`;
};
