import * as translationService from "../services/translation.service.js";
import * as complexityService from "../services/complexity.service.js";
import * as explanationService from "../services/explanation.service.js";
import * as optimizationService from "../services/optimization.service.js";
import { createHistoryEntry } from "../services/history.service.js";

export const translate = async (req, res, next) => {
  try {
    const { code, sourceLanguage, targetLanguage } = req.body;
    if (!code || !sourceLanguage || !targetLanguage) {
      res.status(400);
      throw new Error("Missing required fields: code, sourceLanguage, targetLanguage");
    }

    const result = await translationService.translateCode(code, sourceLanguage, targetLanguage);
    
    // Save to history
    await createHistoryEntry({
      userId: req.user._id,
      sourceLanguage,
      targetLanguage,
      sourceCode: code,
      translatedCode: result,
      action: "translate",
    });

    res.status(200).json({ translatedCode: result });
  } catch (error) {
    next(error);
  }
};

export const complexity = async (req, res, next) => {
  try {
    const { code, sourceLanguage } = req.body;
    if (!code || !sourceLanguage) {
      res.status(400);
      throw new Error("Missing required fields: code, sourceLanguage");
    }

    const result = await complexityService.analyzeComplexity(code, sourceLanguage);

    // Save to history
    await createHistoryEntry({
      userId: req.user._id,
      sourceLanguage,
      targetLanguage: "N/A",
      sourceCode: code,
      complexityAnalysis: result,
      action: "complexity",
    });

    res.status(200).json({ complexityAnalysis: result });
  } catch (error) {
    next(error);
  }
};

export const explain = async (req, res, next) => {
  try {
    const { code, sourceLanguage } = req.body;
    if (!code || !sourceLanguage) {
      res.status(400);
      throw new Error("Missing required fields: code, sourceLanguage");
    }

    const result = await explanationService.explainCode(code, sourceLanguage);

    // Save to history
    await createHistoryEntry({
      userId: req.user._id,
      sourceLanguage,
      targetLanguage: "N/A",
      sourceCode: code,
      explanation: result,
      action: "explain",
    });

    res.status(200).json({ explanation: result });
  } catch (error) {
    next(error);
  }
};

export const optimize = async (req, res, next) => {
  try {
    const { code, sourceLanguage } = req.body;
    if (!code || !sourceLanguage) {
      res.status(400);
      throw new Error("Missing required fields: code, sourceLanguage");
    }

    const result = await optimizationService.optimizeCode(code, sourceLanguage);

    // Save to history
    await createHistoryEntry({
      userId: req.user._id,
      sourceLanguage,
      targetLanguage: "N/A",
      sourceCode: code,
      optimization: result,
      action: "optimize",
    });

    res.status(200).json({ optimization: result });
  } catch (error) {
    next(error);
  }
};
