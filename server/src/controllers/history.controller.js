import * as historyService from "../services/history.service.js";

export const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const action = req.query.action || "";
    const result = await historyService.getUserHistory(req.user._id, page, limit, action);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const entry = await historyService.getHistoryEntry(id, req.user._id);
    res.status(200).json(entry);
  } catch (error) {
    next(error);
  }
};

export const deleteEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    await historyService.deleteHistoryEntry(id, req.user._id);
    res.status(200).json({ message: "History entry deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const clearHistory = async (req, res, next) => {
  try {
    const result = await historyService.clearUserHistory(req.user._id);
    res.status(200).json({ message: "History cleared successfully", deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
};
