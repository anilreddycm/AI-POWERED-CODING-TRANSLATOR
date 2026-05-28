import { Router } from "express";
import { translate, complexity, explain, optimize } from "../controllers/code.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Protect all code endpoints with JWT verification
router.use(protect);

router.post("/translate", translate);
router.post("/complexity", complexity);
router.post("/explain", explain);
router.post("/optimize", optimize);

export default router;
