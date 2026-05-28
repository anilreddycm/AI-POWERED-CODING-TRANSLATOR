import API from "./api.js";

export const translateCode = async (code, sourceLanguage, targetLanguage) => {
  const response = await API.post("/code/translate", { code, sourceLanguage, targetLanguage });
  return response.data;
};

export const analyzeComplexity = async (code, sourceLanguage) => {
  const response = await API.post("/code/complexity", { code, sourceLanguage });
  return response.data;
};

export const explainCode = async (code, sourceLanguage) => {
  const response = await API.post("/code/explain", { code, sourceLanguage });
  return response.data;
};

export const optimizeCode = async (code, sourceLanguage) => {
  const response = await API.post("/code/optimize", { code, sourceLanguage });
  return response.data;
};
