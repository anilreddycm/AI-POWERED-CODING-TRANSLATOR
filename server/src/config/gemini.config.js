import { GoogleGenAI } from "@google/genai";
import "./env.config.js";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not set in environment variables!");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "dummy-key" });

export default ai;
export const GEMINI_MODEL = "gemini-2.5-flash";
