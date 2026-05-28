import { generateAIResponse } from "./gemini.service.js";
import { SYSTEM_PROMPTS } from "../constants/prompts.js";
import { formatExplainPrompt } from "../utils/prompts.utils.js";

/**
 * Explains code logic in plain English
 * @param {string} code - The code to explain
 * @param {string} lang - The programming language
 * @returns {Promise<string>} Explanation in markdown
 */
export const explainCode = async (code, lang) => {
  const prompt = formatExplainPrompt(code, lang);
  return await generateAIResponse(SYSTEM_PROMPTS.EXPLAIN, prompt);
};
