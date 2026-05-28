import { generateAIResponse } from "./gemini.service.js";
import { SYSTEM_PROMPTS } from "../constants/prompts.js";
import { formatTranslatePrompt } from "../utils/prompts.utils.js";

/**
 * Translates code from source language to target language
 * @param {string} code - Source code
 * @param {string} sourceLang - Name of source language
 * @param {string} targetLang - Name of target language
 * @returns {Promise<string>} Translated code
 */
export const translateCode = async (code, sourceLang, targetLang) => {
  const prompt = formatTranslatePrompt(code, sourceLang, targetLang);
  const response = await generateAIResponse(SYSTEM_PROMPTS.TRANSLATE, prompt);
  
  // Clean markdown wrapping if present
  let cleanCode = response;
  if (response.includes("```")) {
    const lines = response.split("\n");
    // Find index of first ``` and last ```
    const firstIdx = lines.findIndex(line => line.startsWith("```"));
    const lastIdx = lines.findLastIndex(line => line.startsWith("```"));
    if (firstIdx !== -1 && lastIdx !== -1 && firstIdx !== lastIdx) {
      cleanCode = lines.slice(firstIdx + 1, lastIdx).join("\n");
    }
  }
  return cleanCode.trim();
};
