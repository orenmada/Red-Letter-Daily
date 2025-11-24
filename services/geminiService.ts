import { GoogleGenAI } from "@google/genai";
import { Saying } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Reflections will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const fetchReflection = async (saying: Saying): Promise<string> => {
  const ai = getAiClient();
  
  if (!ai) {
    throw new Error("API Key not configured");
  }

  try {
    const prompt = `
      Provide a brief, gentle, and encouraging theological reflection on this saying of Jesus.
      
      Quote: "${saying.text}"
      Reference: ${saying.reference}
      Context: ${saying.context || 'Gospel'}

      Keep the tone pastoral, wise, and serene. 
      Limit the response to approximately 80-100 words. 
      Focus on the practical application or spiritual comfort of the verse.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7, // Balance between creativity and consistency
      }
    });

    return response.text || "Unable to generate reflection at this time.";
  } catch (error) {
    console.error("Error generating reflection:", error);
    throw new Error("Failed to contact spiritual advisor service.");
  }
};
