import { GoogleGenAI } from "@google/genai";
import { TattooStyle } from "../types";

// Read Gemini API key from Vite env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

let ai: GoogleGenAI | null = null;

if (!apiKey) {
  console.warn(
    "VITE_GEMINI_API_KEY is not set. Gemini AI features are disabled."
  );
} else {
  ai = new GoogleGenAI({ apiKey });
}

export const generateTattooDesign = async (
  description: string,
  style: TattooStyle,
  placement: string
): Promise<string> => {
  if (!ai) {
    throw new Error(
      "Gemini AI is not configured. Please set VITE_GEMINI_API_KEY in .env.local."
    );
  }

  try {
    const prompt = `Create a high-quality, professional tattoo design. 
    Style: ${style}. 
    Subject: ${description}. 
    Placement consideration: ${placement}. 
    The design should be clear, with high contrast suitable for stenciling. 
    White background.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }

    throw new Error("No image data returned from Gemini.");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
