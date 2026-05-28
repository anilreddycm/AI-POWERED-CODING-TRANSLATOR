import ai, { GEMINI_MODEL } from "../config/gemini.config.js";

/**
 * Sends a prompt with optional system instructions to Gemini LLM
 * @param {string} systemInstruction - The system persona/instructions
 * @param {string} prompt - The user prompt/content
 * @returns {Promise<string>} The AI response text
 */
export const generateAIResponse = async (systemInstruction, prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature for high precision/consistency in code tasks
      },
    });

    if (!response || !response.text) {
      throw new Error("Empty response received from Gemini");
    }

    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error(`Gemini service failed: ${error.message}`);
  }
};
