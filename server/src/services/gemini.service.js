import { GoogleGenAI } from "@google/genai";
import "../config/env.config.js";

// Helper to parse comma-separated keys from environment variables
const parseKeys = (singleKey, multiKeys) => {
  const keysStr = multiKeys || singleKey || "";
  return keysStr
    .split(",")
    .map(key => key.trim())
    .filter(key => key.length > 0);
};

// Retrieve all raw keys from the environment variables
const rawGeminiKeys = parseKeys(process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEYS);
const rawGroqKeys = parseKeys(process.env.GROQ_API_KEY, process.env.GROQ_API_KEYS);
const rawOpenRouterKeys = parseKeys(process.env.OPENROUTER_API_KEY, process.env.OPENROUTER_API_KEYS);

// Combine all loaded keys into a single pool to classify them by prefix
const allKeys = [...rawGeminiKeys, ...rawGroqKeys, ...rawOpenRouterKeys];

const geminiKeys = [];
const groqKeys = [];
const openRouterKeys = [];

for (const key of allKeys) {
  if (key.startsWith("AIzaSy")) {
    geminiKeys.push(key);
  } else if (key.startsWith("gsk_")) {
    groqKeys.push(key);
  } else if (key.startsWith("sk-or-")) {
    openRouterKeys.push(key);
  } else {
    // If prefix is unknown, default to Gemini (standard Google key format)
    geminiKeys.push(key);
  }
}

// Print status logs at startup
console.log("\n[AI SERVICE INITIALIZATION - CLASSIFIED POOL]");
console.log(`- Total unique keys detected: ${allKeys.length}`);
console.log(`- Classified Gemini keys: ${geminiKeys.length}`);
console.log(`- Classified Groq keys: ${groqKeys.length}`);
console.log(`- Classified OpenRouter keys: ${openRouterKeys.length}`);
if (geminiKeys.length === 0 && groqKeys.length === 0 && openRouterKeys.length === 0) {
  console.warn("WARNING: No AI API keys loaded! Set GEMINI_API_KEY in your .env");
}
console.log("");

// Rotate counters for each provider
let geminiIndex = 0;
let groqIndex = 0;
let openRouterIndex = 0;

const getNextGeminiKey = () => {
  if (geminiKeys.length === 0) return null;
  const key = geminiKeys[geminiIndex];
  geminiIndex = (geminiIndex + 1) % geminiKeys.length;
  return key;
};

const getNextGroqKey = () => {
  if (groqKeys.length === 0) return null;
  const key = groqKeys[groqIndex];
  groqIndex = (groqIndex + 1) % groqKeys.length;
  return key;
};

const getNextOpenRouterKey = () => {
  if (openRouterKeys.length === 0) return null;
  const key = openRouterKeys[openRouterIndex];
  openRouterIndex = (openRouterIndex + 1) % openRouterKeys.length;
  return key;
};

// Provider callers
const callGemini = async (key, systemInstruction, prompt) => {
  const ai = new GoogleGenAI({ apiKey: key });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.2,
    },
  });
  if (!response || !response.text) {
    throw new Error("Empty response from Gemini");
  }
  return response.text;
};

const callGroq = async (key, systemInstruction, prompt) => {
  if (!globalThis.fetch) {
    throw new Error("Node.js global fetch is not available. Please upgrade Node.js to v18+");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq HTTP error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
    throw new Error("Invalid response structure from Groq");
  }
  return data.choices[0].message.content;
};

const callOpenRouter = async (key, systemInstruction, prompt) => {
  if (!globalThis.fetch) {
    throw new Error("Node.js global fetch is not available. Please upgrade Node.js to v18+");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5000",
      "X-Title": "AI Code Translator",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter HTTP error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (!data.choices || data.choices.length === 0 || !data.choices[0].message?.content) {
    throw new Error("Invalid response structure from OpenRouter");
  }
  return data.choices[0].message.content;
};

/**
 * Sends a prompt with optional system instructions to the configured AI models.
 * Features round-robin rotation for keys per provider and provider-level fallback.
 * 
 * @param {string} systemInstruction - The system persona/instructions
 * @param {string} prompt - The user prompt/content
 * @returns {Promise<string>} The AI response text
 */
export const generateAIResponse = async (systemInstruction, prompt) => {
  const errors = [];

  // 1. Try Gemini Keys
  if (geminiKeys.length > 0) {
    console.log(`[AI SERVICE] Attempting Gemini fallback chain (${geminiKeys.length} keys available)...`);
    for (let i = 0; i < geminiKeys.length; i++) {
      const key = getNextGeminiKey();
      try {
        const keyObfuscated = `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
        console.log(`[AI SERVICE] Trying Gemini Key: ${keyObfuscated}`);
        const result = await callGemini(key, systemInstruction, prompt);
        return result;
      } catch (err) {
        console.warn(`[AI SERVICE] Gemini Key failed: ${err.message}`);
        errors.push(`Gemini key failed: ${err.message}`);
      }
    }
  }

  // 2. Try Groq Keys
  if (groqKeys.length > 0) {
    console.log(`[AI SERVICE] Attempting Groq fallback chain (${groqKeys.length} keys available)...`);
    for (let i = 0; i < groqKeys.length; i++) {
      const key = getNextGroqKey();
      try {
        const keyObfuscated = `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
        console.log(`[AI SERVICE] Trying Groq Key: ${keyObfuscated}`);
        const result = await callGroq(key, systemInstruction, prompt);
        return result;
      } catch (err) {
        console.warn(`[AI SERVICE] Groq Key failed: ${err.message}`);
        errors.push(`Groq key failed: ${err.message}`);
      }
    }
  }

  // 3. Try OpenRouter Keys
  if (openRouterKeys.length > 0) {
    console.log(`[AI SERVICE] Attempting OpenRouter fallback chain (${openRouterKeys.length} keys available)...`);
    for (let i = 0; i < openRouterKeys.length; i++) {
      const key = getNextOpenRouterKey();
      try {
        const keyObfuscated = `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
        console.log(`[AI SERVICE] Trying OpenRouter Key: ${keyObfuscated}`);
        const result = await callOpenRouter(key, systemInstruction, prompt);
        return result;
      } catch (err) {
        console.warn(`[AI SERVICE] OpenRouter Key failed: ${err.message}`);
        errors.push(`OpenRouter key failed: ${err.message}`);
      }
    }
  }

  // If we reach here, either no keys were configured, or all of them failed
  const errorMsg = errors.length > 0 
    ? `All AI providers and keys failed:\n- ${errors.join("\n- ")}`
    : "No API keys configured! Please set GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY in your .env file.";
  
  console.error(`[AI SERVICE ERROR] ${errorMsg}`);
  throw new Error(errorMsg);
};
