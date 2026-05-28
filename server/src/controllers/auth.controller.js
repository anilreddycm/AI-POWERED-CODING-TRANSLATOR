import * as authService from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }
    const result = await authService.registerUser(name, email, password);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Please enter email and password");
    }
    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    if (error.isNotVerified) {
      return res.status(403).json({
        message: error.message,
        isNotVerified: true,
        email,
      });
    }
    next(error);
  }
};

export const verifyEmailOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400);
      throw new Error("Email and verification code are required");
    }
    const result = await authService.verifyOTP(email, otp);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const resendEmailOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }
    const result = await authService.resendOTP(email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400);
      throw new Error("Google token is required");
    }
    const result = await authService.loginWithGoogle(token);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
