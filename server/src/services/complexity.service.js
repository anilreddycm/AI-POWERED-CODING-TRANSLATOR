import { generateAIResponse } from "./gemini.service.js";
import { SYSTEM_PROMPTS } from "../constants/prompts.js";
import { formatComplexityPrompt } from "../utils/prompts.utils.js";

/**
 * Analyzes time and space complexity of code
 * @param {string} code - The code to analyze
 * @param {string} lang - The programming language
 * @returns {Promise<string>} Analysis in markdown
 */
export const analyzeComplexity = async (code, lang) => {
  const prompt = formatComplexityPrompt(code, lang);
  return await generateAIResponse(SYSTEM_PROMPTS.COMPLEXITY, prompt);
};
