import { GoogleGenAI } from "@google/genai";

export const generateBio = async (title: string, experience: number, skills: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API Key not found, returning mock bio.");
      return `A passionate ${title} with ${experience} years of experience in ${skills}. Dedicated to delivering high-quality work.`;
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Write a professional, concise (max 50 words) freelancer biography for a ${title} with ${experience} years of experience. Key skills: ${skills}. The tone should be creative and confident.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate bio.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating bio. Please write one manually.";
  }
};
