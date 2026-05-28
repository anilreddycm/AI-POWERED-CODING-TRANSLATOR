export const formatTranslatePrompt = (code, sourceLang, targetLang) => {
  return `Translate the following ${sourceLang} code into ${targetLang}:\n\n\`\`\`${sourceLang}\n${code}\n\`\`\``;
};

export const formatComplexityPrompt = (code, lang) => {
  return `Analyze the time and space complexity of this ${lang} code:\n\n\`\`\`${lang}\n${code}\n\`\`\``;
};

export const formatExplainPrompt = (code, lang) => {
  return `Explain this ${lang} code in detail:\n\n\`\`\`${lang}\n${code}\n\`\`\``;
};

export const formatOptimizePrompt = (code, lang) => {
  return `Optimize this ${lang} code:\n\n\`\`\`${lang}\n${code}\n\`\`\``;
};
