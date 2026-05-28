import { Router } from "express";
import { getHistory, getEntry, deleteEntry, clearHistory } from "../controllers/history.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Protect all history endpoints with JWT verification
router.use(protect);

router.get("/", getHistory);
router.delete("/", clearHistory);
router.get("/:id", getEntry);
router.delete("/:id", deleteEntry);

export default router;
