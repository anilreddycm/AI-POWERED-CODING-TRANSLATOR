import { generateAIResponse } from "./gemini.service.js";
import { SYSTEM_PROMPTS } from "../constants/prompts.js";
import { formatOptimizePrompt } from "../utils/prompts.utils.js";

/**
 * Optimizes code performance/readability
 * @param {string} code - The code to optimize
 * @param {string} lang - The programming language
 * @returns {Promise<string>} Optimizations and code in markdown
 */
export const optimizeCode = async (code, lang) => {
  const prompt = formatOptimizePrompt(code, lang);
  return await generateAIResponse(SYSTEM_PROMPTS.OPTIMIZE, prompt);
};
