import { Router } from "express";
import { register, login, googleLogin, logout, verifyEmailOTP, resendEmailOTP } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/logout", logout);
router.post("/verify-otp", verifyEmailOTP);
router.post("/resend-otp", resendEmailOTP);

export default router;
